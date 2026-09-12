import urllib.request
import json
import re
import os
import time

def get_html(url):
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    for _ in range(3):
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                return response.read().decode('utf-8')
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            time.sleep(2)
    return ""

def main():
    files = [
        r"C:\Users\asus\.gemini\antigravity\brain\0c80a9f6-f939-449b-a528-c53639c452d6\.system_generated\steps\6\content.md",
        r"C:\Users\asus\.gemini\antigravity\brain\0c80a9f6-f939-449b-a528-c53639c452d6\.system_generated\steps\7\content.md",
        r"C:\Users\asus\.gemini\antigravity\brain\0c80a9f6-f939-449b-a528-c53639c452d6\.system_generated\steps\8\content.md",
        r"C:\Users\asus\.gemini\antigravity\brain\0c80a9f6-f939-449b-a528-c53639c452d6\.system_generated\steps\9\content.md",
        r"C:\Users\asus\.gemini\antigravity\brain\0c80a9f6-f939-449b-a528-c53639c452d6\.system_generated\steps\10\content.md",
        r"C:\Users\asus\.gemini\antigravity\brain\0c80a9f6-f939-449b-a528-c53639c452d6\.system_generated\steps\11\content.md",
    ]
    
    urls = []
    for f in files:
        if os.path.exists(f):
            with open(f, 'r', encoding='utf-8') as f_in:
                content = f_in.read()
                matches = re.findall(r'href="(https://wbbus\.in/bus/[^"]+)"', content)
                urls.extend(matches)
        else:
            print(f"File not found: {f}")
            
    seen = set()
    unique_urls = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            unique_urls.append(u)
            
    print(f"Found {len(unique_urls)} unique bus URLs")
    
    all_buses = []
    
    for i, url in enumerate(unique_urls):
        print(f"[{i+1}/{len(unique_urls)}] Fetching {url}")
        html = get_html(url)
        if not html:
            continue
            
        bus_data = {'url': url}
        
        # Name
        m = re.search(r'<td>Bus Name :</td>\s*<td><span>([^<]+)</span></td>', html)
        if m: bus_data['name'] = m.group(1).strip()
        
        # Reg No
        m = re.search(r'<td>Registration Number :</td>\s*<td><span[^>]*>([^<]+)</span></td>', html)
        if m: bus_data['reg_no'] = m.group(1).strip()
        
        # Route
        m = re.search(r'<div class="content">\s*<h5>[^<]+</h5>\s*<p>([^<]+)</p>', html)
        if m: bus_data['route'] = m.group(1).strip()
        
        # Timetable
        timetable_block_m = re.search(r'<div class="card-body pt-0 card_body">(.*?)</div>\s*</div>\s*<div class="card">', html, re.DOTALL)
        if timetable_block_m:
            timetable_html = timetable_block_m.group(1)
            stops = []
            
            stop_blocks = re.split(r'<div class="row sud text-center border-bottom py-2">', timetable_html)[1:]
            for block in stop_blocks:
                cols = re.findall(r'<div class="col-md-[^>]+>(.*?)</div>', block, re.DOTALL)
                if len(cols) >= 4:
                    up_time = re.sub(r'<[^>]+>', '', cols[1]).strip()
                    stop_name = re.sub(r'<[^>]+>', '', cols[2]).strip()
                    down_time = re.sub(r'<[^>]+>', '', cols[3]).strip()
                    stops.append({
                        'up_time': up_time,
                        'stop_name': stop_name,
                        'down_time': down_time
                    })
            bus_data['stops'] = stops
            
        all_buses.append(bus_data)
        
    out_path = r"d:\Where is my Bus\buses.json"
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(all_buses, f, indent=2, ensure_ascii=False)
        
    print(f"Saved {len(all_buses)} buses to {out_path}")

if __name__ == '__main__':
    main()
