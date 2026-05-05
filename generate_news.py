import os
import random

# Simulated generic news data to stay legally safe and generic
topics = {
    "Technology": ["AI development", "Quantum computing", "Smart cities", "Green energy tech", "Space exploration"],
    "Science": ["Mars mission", "Deep sea discovery", "Genetic research", "Renewable sources", "Climate patterns"],
    "Economics": ["Global trade", "Digital currency", "Market trends", "Startup growth", "Sustainable finance"],
    "เทคโนโลยี": ["การพัฒนา AI", "คอมพิวเตอร์ควอนตัม", "เมืองอัจฉริยะ", "พลังงานสะอาด", "การสำรวจอวกาศ"],
    "วิทยาศาสตร์": ["ภารกิจดาวอังคาร", "การค้นพบใต้ทะเลลึก", "การวิจัยพันธุกรรม", "แหล่งพลังงานหมุนเวียน", "รูปแบบภูมิอากาศ"]
}

content_templates_en = [
    "Today in {topic}, experts discuss {detail}. This shift could redefine how we view [[{link}]].",
    "A new report on {topic} highlights the importance of {detail}. Many compare this to [[{link}]].",
    "Innovators in the field of {topic} are focusing on {detail}. It has strong ties to [[{link}]].",
]

content_templates_th = [
    "วันนี้ในด้าน{topic} ผู้เชี่ยวชาญร่วมหารือเกี่ยวกับ{detail} การเปลี่ยนแปลงนี้อาจส่งผลต่อการมอง [[{link}]]",
    "รายงานใหม่เกี่ยวกับ{topic} เน้นย้ำความสำคัญของ{detail} หลายคนเปรียบเทียบเรื่องนี้กับ [[{link}]]",
    "นวัตกรในสาขา{topic} กำลังให้ความสนใจกับ{detail} ซึ่งมีความเชื่อมโยงอย่างมากกับ [[{link}]]",
]

def generate_news(count=15):
    if not os.path.exists('note'):
        os.makedirs('note')
    
    existing_notes = [f.replace('.md', '') for f in os.listdir('note') if f.endswith('.md')]
    all_titles = list(topics.keys()) + [item for sublist in topics.values() for item in sublist]
    
    for i in range(count):
        lang = random.choice(['en', 'th'])
        topic_key = random.choice(list(topics.keys()))
        
        # Ensure we pick a topic key that matches the language
        is_thai = any(c > '\u0e00' for c in topic_key)
        if lang == 'th' and not is_thai:
            topic_key = "เทคโนโลยี"
        elif lang == 'en' and is_thai:
            topic_key = "Technology"
            
        topic_name = topic_key
        detail = random.choice(topics[topic_key])
        
        # Link to random existing note or a new potential title
        link = random.choice(existing_notes + all_titles)
        
        title = f"{topic_name} News {i+1}"
        if lang == 'th':
            content = random.choice(content_templates_th).format(topic=topic_name, detail=detail, link=link)
        else:
            content = random.choice(content_templates_en).format(topic=topic_name, detail=detail, link=link)

        # Make it "long" as requested by repeating or adding detail
        long_content = f"# {title}\n\n" + (content + "\n\n") * 5
        long_content += f"\n\nReference to another topic: [[{random.choice(all_titles)}]]"
        
        file_path = os.path.join('note', f"{title}.md")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(long_content)
        print(f"Generated: {file_path}")

if __name__ == "__main__":
    generate_news()
