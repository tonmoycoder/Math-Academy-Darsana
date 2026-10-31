import sys

sys.stdout.reconfigure(encoding='utf-8')

# 1. Update 03-sections.html
with open('_src/03-sections.html', 'r', encoding='utf-8') as f:
    text = f.read()

target = '''            <p>
              আমি <b>প্রান্ত রায়</b>। <b>দর্শনা আইডিয়াল স্কুলে</b> গণিত পড়াই এবং দর্শনার <b>ম্যাথ একাডেমি</b>-তে
              <b>SSC ও {{CLASS_RANGE}}</b> শিক্ষার্থীদের জন্য অফলাইন ব্যাচ পরিচালনা করি। গণিতে অনার্স ও মাস্টার্স,
              এবং <b>১০+ বছরের</b> শ্রেণিকক্ষ-অভিজ্ঞতা আমার পরিচিতির অংশ।
            </p>'''

replacement = '''            <p>
              আমি <b>প্রান্ত রায়</b>। <b>দর্শনা আইডিয়াল স্কুলে</b> গণিত পড়াই এবং দর্শনার <b>ম্যাথ একাডেমি</b>-তে
              <b>SSC ও {{CLASS_RANGE}}</b> শিক্ষার্থীদের জন্য অফলাইন ব্যাচ পরিচালনা করি। গণিতে অনার্স ও মাস্টার্স,
              এবং <b>১০+ বছরের</b> শ্রেণিকক্ষ-অভিজ্ঞতা আমার পরিচিতির অংশ।
            </p>'''}

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
replacement_bot = '''<p>SSC ও ক্লাস ৬–১০ শিক্ষার্থীদের জন্য দর্শনার গণিত শিক্ষা প্রতিষ্ঠান। প্রতিষ্ঠাতা ও গণিত শিক্ষক <strong>Pranto Rai</strong> (শিক্ষক, <strong>Darsana Ideal School</strong>) দর্শনা, চুয়াডাঙ্গায় অফলাইন গণিতের ব্যাচ পরিচালনা করেন।</p>'''

text_bot_norm = text_bot.replace('\r\n', '\n')
target_bot_norm = target_bot.replace('\r\n', '\n')

if target_bot_norm in text_bot_norm:
    text_bot_norm = text_bot_norm.replace(target_bot_norm, replacement_bot)
    with open('_src/04-bottom.html', 'w', encoding='utf-8') as f:
        f.write(text_bot_norm)
    print('04-bottom.html updated with footer SEO keywords!')
else:
    print('Target not found in 04-bottom.html')

