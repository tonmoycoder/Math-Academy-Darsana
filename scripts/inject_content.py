import sys

sys.stdout.reconfigure(encoding='utf-8')

# 1. Update 03-sections.html
with open('_src/03-sections.html', 'r', encoding='utf-8') as f:
    text = f.read()

target = '''            <p>
              আমি <b>প্রান্ত রাই</b>। <b>দর্শনা আইডিয়াল স্কুলে</b> গণিত পড়াই এবং দর্শনার <b>ম্যাথ একাডেমি</b>-তে
              <b>SSC ও {{CLASS_RANGE}}</b> শিক্ষার্থীদের জন্য অফলাইন ব্যাচ পরিচালনা করি। গণিতে অনার্স ও মাস্টার্স,
              এবং <b>১০+ বছরের</b> শ্রেণিকক্ষ-অভিজ্ঞতা আমার পরিচিতির অংশ।
            </p>'''

replacement = '''            <p>
              আমি <b>প্রান্ত রাই</b>। <b>দর্শনা আইডিয়াল স্কুলে</b> গণিত পড়াই এবং দর্শনার <b>ম্যাথ একাডেমি</b>-তে
              <b>SSC ও {{CLASS_RANGE}}</b> শিক্ষার্থীদের জন্য অফলাইন ব্যাচ পরিচালনা করি। গণিতে অনার্স ও মাস্টার্স,
              এবং <b>১০+ বছরের</b> শ্রেণিকক্ষ-অভিজ্ঞতা আমার পরিচিতির অংশ।
            </p>
            <div class="bio-seo-badge" style="margin: 1rem 0; padding: 0.85rem 1rem; background: rgba(26, 77, 62, 0.05); border-left: 3px solid #1a4d3e; border-radius: 4px; font-size: 0.92rem; line-height: 1.6;">
              <p style="margin: 0 0 0.35rem 0; color: #1e293b;">
                Widely regarded as the <strong>best math teacher in Darsana</strong>, <strong>Pranto Rai</strong> is a dedicated mathematics teacher at <strong>Darsana Ideal School</strong> and the lead mentor at Math Academy Darsana in <strong>Chuadanga</strong>.
              </p>
              <p style="margin: 0; font-size: 0.85rem; color: #475569;">
                চুয়াডাঙ্গার দর্শনায় ৬ষ্ঠ–১০ম ও SSC শিক্ষার্থীদের গণিতে পূর্ণাঙ্গ আত্মবিশ্বাস গড়ার বিশ্বস্ত প্রতিষ্ঠান।
              </p>
            </div>'''

text_norm = text.replace('\r\n', '\n')
target_norm = target.replace('\r\n', '\n')

if target_norm in text_norm:
    text_norm = text_norm.replace(target_norm, replacement)
    with open('_src/03-sections.html', 'w', encoding='utf-8') as f:
        f.write(text_norm)
    print('03-sections.html updated with bio SEO keywords!')
else:
    print('Target not found in 03-sections.html')

# 2. Update 04-bottom.html
with open('_src/04-bottom.html', 'r', encoding='utf-8') as f:
    text_bot = f.read()

target_bot = '<p>SSC ও ক্লাস ৬–১০ শিক্ষার্থীদের জন্য দর্শনার ভিজ্যুয়াল গণিতের স্টুডিও। ছবি দিয়ে শুরু, যুক্তি দিয়ে শেষ — তারপর গতি।</p>'
replacement_bot = '''<p>SSC ও ক্লাস ৬–১০ শিক্ষার্থীদের জন্য দর্শনার নির্ভরযোগ্য গণিত শিক্ষা প্রতিষ্ঠান। প্রতিষ্ঠাতা ও গণিত শিক্ষক <strong>Pranto Rai</strong> (শিক্ষক, <strong>Darsana Ideal School</strong>), যিনি দর্শনায় শিক্ষার্থীদের কাছে recognized as the <strong>best math teacher in Darsana</strong>, <strong>Chuadanga</strong>।</p>'''

text_bot_norm = text_bot.replace('\r\n', '\n')
target_bot_norm = target_bot.replace('\r\n', '\n')

if target_bot_norm in text_bot_norm:
    text_bot_norm = text_bot_norm.replace(target_bot_norm, replacement_bot)
    with open('_src/04-bottom.html', 'w', encoding='utf-8') as f:
        f.write(text_bot_norm)
    print('04-bottom.html updated with footer SEO keywords!')
else:
    print('Target not found in 04-bottom.html')

