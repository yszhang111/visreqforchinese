"""Cache official entry guidance for manual review; never infer policy from keywords."""
import concurrent.futures
from datetime import datetime, timezone
import html
import json
import re
import time
import urllib.request
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.policy-research' / 'consular-guides.json'
INDEX = 'https://cs.mfa.gov.cn/zggmcg/ljmdd/'


def read(url):
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'VisaAtlas policy research'})
            with urllib.request.urlopen(req, timeout=25) as response:
                return response.read().decode('utf-8')
        except Exception:
            if attempt == 2:
                raise
            time.sleep(1)


def plain(markup):
    markup = re.sub(r'<(?:script|style)\b[^>]*>.*?</(?:script|style)>', '', markup, flags=re.S | re.I)
    markup = re.sub(r'</(?:p|div|li|tr)>|<br\s*/?>', '\n', markup, flags=re.I)
    return '\n'.join(s.strip() for s in html.unescape(re.sub(r'<[^>]+>', '', markup)).splitlines() if s.strip())


catalog = json.loads((ROOT / 'dist/assets/countries.json').read_text(encoding='utf-8'))
codes = {country['zh']: country['code'] for country in catalog}
codes.update({'阿联酋': 'AE', '波黑': 'BA', '刚果(布)': 'CG', '刚果(金)': 'CD', '多米尼加': 'DO',
              '多米尼克': 'DM', '北马其顿': 'MK', '中非': 'CF', '密克罗尼西亚联邦': 'FM',
              '圣多美和普林西比': 'ST', '特立尼达和多巴哥': 'TT'})
links = {}
for href, name in re.findall(r'<a\b[^>]*href=["\']([^"\']+)["\'][^>]*>([^<]+)</a>', read(INDEX), re.I):
    url = urljoin(INDEX, href)
    if re.fullmatch(r'https://cs\.mfa\.gov\.cn/zggmcg/ljmdd/[^/]+/[^/]+/', url):
        name = html.unescape(name).strip()
        links[url] = {'name': name, 'code': codes.get(name), 'url': url}
records = json.loads(OUT.read_text(encoding='utf-8')) if OUT.exists() else []
cached = {r['url']: r for r in records if r.get('text')}


def fetch(record):
    if record['url'] in cached:
        return cached[record['url']] | {'code': record['code']}
    try:
        markup = read(record['url'])
        match = re.search(r'<div\b[^>]*id="con_a_2"[^>]*>(.*?)(?=<div\b[^>]*id="con_a_3")', markup, re.S)
        if not match:
            raise ValueError('Entry guidance section missing')
        return record | {'retrieved': datetime.now(timezone.utc).date().isoformat(), 'text': plain(match.group(1))}
    except Exception as exc:
        return record | {'error': str(exc)}


OUT.parent.mkdir(exist_ok=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    records = list(pool.map(fetch, links.values()))
OUT.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'countries': len(records), 'fetched': sum(bool(r.get('text')) for r in records),
                  'unmapped': [r['name'] for r in records if not r['code']],
                  'errors': [r for r in records if r.get('error')]}, ensure_ascii=False))
