from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json
import urllib.request
import subprocess

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'dist' / 'assets'
ASSETS.mkdir(parents=True, exist_ok=True)
URLS = {
    'd3.min.js': 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js',
    'topojson.min.js': 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js',
    'world.json': 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-10m.json',
    'boundary-source.json': 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson',
    'country-source.json': 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json',
}

def download(item):
    name, url = item
    request = urllib.request.Request(url, headers={'User-Agent': 'VisaAtlas/1.0'})
    with urllib.request.urlopen(request, timeout=40) as response:
        data = response.read()
    (ASSETS / name).write_bytes(data)
    return f'{name}: {len(data)} bytes'

with ThreadPoolExecutor(max_workers=4) as pool:
    for result in pool.map(download, URLS.items()):
        print(result)

countries = json.loads((ASSETS / 'country-source.json').read_text(encoding='utf-8'))
catalog = []
for country in countries:
    if not country.get('ccn3') or country.get('cca2') == 'AQ':
        continue
    catalog.append({
        'id': country['ccn3'], 'code': country['cca2'],
        'name': country['name']['common'],
        'zh': country.get('translations', {}).get('zho', {}).get('common', ''),
        'region': country['region'], 'latlng': country.get('latlng', [0, 0]),
        'independent': country.get('independent', False),
    })
(ASSETS / 'countries.json').write_text(json.dumps(catalog, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
(ASSETS / 'country-source.json').unlink()
print(f'Country catalog: {len(catalog)} entries')

# Quantization collapses Vatican City and some Maldivian island rings.
# Preserve original rings; degenerate islands can otherwise fill the globe.
boundary_source = json.loads((ASSETS / 'boundary-source.json').read_text(encoding='utf-8'))
original_ids = {'VAT': ('336', 'Vatican'), 'MDV': ('462', 'Maldives')}
supplement = {'type': 'FeatureCollection', 'features': [
    {'type': 'Feature', 'id': original_ids[f['properties']['ADM0_A3']][0],
     'properties': {'name': original_ids[f['properties']['ADM0_A3']][1]}, 'geometry': f['geometry']}
    for f in boundary_source['features'] if f['properties']['ADM0_A3'] in original_ids
]}
(ASSETS / 'small-country-boundaries.json').write_text(json.dumps(supplement, separators=(',', ':')), encoding='utf-8')
(ASSETS / 'boundary-source.json').unlink()
print('Original small-country boundaries preserved')
subprocess.run(['node', str(ROOT / 'scripts' / 'prepare-map-lod.js')], check=True)
