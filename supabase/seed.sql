-- ═══════════════════════════════════════════════════════════════════
-- JM Majiwa — Seed Data
-- 8 categories • 12 products • 3 bundles • 2 coupons • 6 blog posts
-- ═══════════════════════════════════════════════════════════════════

-- ─── CATEGORIES ────────────────────────────────────────────────────
insert into public.categories (id, name, slug, description, icon, color, is_featured, sort_order) values
  ('00000000-0000-4000-8000-0000000000c1', 'AI Prompt Packs', 'ai-prompt-packs', 'Ready-to-use prompts for ChatGPT, Claude and Gemini.', '🤖', 'violet', true, 1),
  ('00000000-0000-4000-8000-0000000000c2', 'Canva Templates', 'canva-templates', 'Drag-and-drop Canva designs for every platform.', '🎨', 'blue', true, 2),
  ('00000000-0000-4000-8000-0000000000c3', 'eBooks', 'ebooks', 'Practical digital books written for the Kenyan market.', '📚', 'orange', true, 3),
  ('00000000-0000-4000-8000-0000000000c4', 'Social Media Packs', 'social-media-packs', 'Reels, stories and post packs that grow your audience.', '📱', 'pink', true, 4),
  ('00000000-0000-4000-8000-0000000000c5', 'Digital Learning', 'digital-learning', 'KCSE, KCPE and university study materials.', '🎓', 'neon', true, 5),
  ('00000000-0000-4000-8000-0000000000c6', 'Productivity Tools', 'productivity-tools', 'Templates and systems that save you hours weekly.', '⚡', 'yellow', true, 6),
  ('00000000-0000-4000-8000-0000000000c7', 'Business Templates', 'business-templates', 'Plans, invoices and documents for Kenyan businesses.', '💼', 'navy', true, 7),
  ('00000000-0000-4000-8000-0000000000c8', 'Mega Bundles', 'mega-bundles', 'Our biggest value packs at unbelievable prices.', '🎁', 'orange', true, 8)
on conflict (id) do nothing;

-- ─── PRODUCTS ──────────────────────────────────────────────────────
insert into public.products (
  id, title, slug, short_description, description, category_id,
  price, sale_price, thumbnail_url, file_url, file_size, file_format,
  tags, features, what_is_included,
  is_published, is_featured, is_best_seller, is_new,
  total_downloads, total_sales, average_rating, review_count
) values
  ('00000000-0000-4000-8000-0000000000p1', 'Ultimate ChatGPT Prompt Pack 500', 'ultimate-chatgpt-prompt-pack-500',
   '500 battle-tested ChatGPT prompts for marketing, business, content creation and study.',
   'Stop staring at a blank chat window. The Ultimate ChatGPT Prompt Pack gives you 500 carefully engineered prompts organised into 12 categories: marketing copy, social media, business strategy, emails, sales, studying, coding, and more. Every prompt includes placeholders so you can personalise it in seconds.',
   '00000000-0000-4000-8000-0000000000c1',
   1200, null,
   'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=75',
   'products/chatgpt-prompt-pack-500.zip', '4.2 MB', 'PDF + Notion',
   array['chatgpt','ai','prompts','marketing'],
   array['500 copy-paste ready prompts in 12 categories','Fill-in-the-blank placeholders for instant personalisation','Bonus: 50 power prompts for M-Pesa business owners','Free lifetime updates as ChatGPT evolves'],
   array['120-page PDF prompt library','Notion template with searchable database','Quick-start guide','Bonus: prompt engineering cheat sheet'],
   true, true, true, false, 3421, 2140, 4.9, 312),

  ('00000000-0000-4000-8000-0000000000p2', 'Canva Social Media Mega Pack', 'canva-social-media-mega-pack',
   '300+ editable Canva templates for Instagram, TikTok, Facebook and WhatsApp status.',
   'Look like a professional agency without hiring one. This mega pack includes 300+ fully editable Canva templates: Instagram posts, carousels, stories, reels covers, Facebook banners and WhatsApp status designs. Every template uses free Canva elements and can be edited in under two minutes.',
   '00000000-0000-4000-8000-0000000000c2',
   890, null,
   'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=900&q=75',
   'products/canva-social-media-mega-pack.zip', '18.5 MB', 'Canva Links + PDF',
   array['canva','social-media','instagram','templates'],
   array['300+ editable templates across 6 platforms','Uses only free Canva elements','Brand kit guide: fonts, colours and logo placement','30-day content calendar included'],
   array['120 Instagram post & carousel templates','90 story and reels cover templates','60 Facebook & WhatsApp templates','Content calendar + caption ideas PDF'],
   true, true, true, false, 2810, 1875, 4.8, 254),

  ('00000000-0000-4000-8000-0000000000p3', 'Kenya KCSE Study Bundle 2024', 'kenya-kcse-study-bundle-2024',
   'Complete KCSE revision bundle: topical notes, past papers with marking schemes, and exam tips.',
   'Everything a KCSE candidate needs in one download. Topical revision notes aligned to the KICD syllabus, 10 years of past papers with official marking schemes, prediction papers, and examiner-approved answering techniques.',
   '00000000-0000-4000-8000-0000000000c5',
   1500, null,
   'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=75',
   'products/kcse-study-bundle-2024.zip', '120 MB', 'PDF',
   array['kcse','education','revision','kenya'],
   array['Topical notes for all 8 compulsory subjects','10 years of past papers + marking schemes','Examiner tips for scoring As','Printable revision timetable'],
   array['8-subject topical revision notes (600+ pages)','Past papers 2014-2023 with marking schemes','3 prediction papers per subject','Study planner + motivation tracker'],
   true, true, true, false, 4102, 2688, 4.9, 421),

  ('00000000-0000-4000-8000-0000000000p4', 'Claude AI Prompt Collection', 'claude-ai-prompt-collection',
   '250 advanced prompts engineered specifically for Claude — long-form writing, analysis and coding.',
   'Claude responds best to structured instructions — and this collection is engineered exactly for that. 250 advanced prompts for long-form content, data analysis, coding assistance, research summaries and business planning.',
   '00000000-0000-4000-8000-0000000000c1',
   950, null,
   'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=900&q=75',
   'products/claude-ai-prompt-collection.zip', '2.8 MB', 'PDF + Notion',
   array['claude','ai','prompts','writing'],
   array['250 prompts tuned for Claude strengths','Chain-of-thought and role-prompt templates','Long-form writing frameworks','Coding review and refactoring prompts'],
   array['90-page prompt playbook','Notion database with categories & favourites','10 real worked examples with outputs'],
   true, true, true, false, 1650, 1120, 4.8, 167),

  ('00000000-0000-4000-8000-0000000000p5', 'Business Plan Templates Kenya', 'business-plan-templates-kenya',
   'Investor-ready business plan, pitch deck and financial model templates tailored for Kenya.',
   'Raise funding and win tenders with documents that look like they cost 50,000 KES. Includes a full business plan template, a 12-slide pitch deck, a 3-year financial model, and a tender response template — all localised for Kenya.',
   '00000000-0000-4000-8000-0000000000c7',
   1100, null,
   'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=75',
   'products/business-plan-templates-kenya.zip', '9.4 MB', 'DOCX + XLSX + PPTX',
   array['business','startup','funding','kenya'],
   array['Investor-ready business plan template','12-slide pitch deck (PowerPoint + Canva)','3-year financial model with Kenyan tax lines','Tender/proposal response template'],
   array['Business plan DOCX (40 pages, guided)','Pitch deck PPTX + Canva link','Financial model XLSX with formulas','Guide: how Kenyan investors read plans'],
   true, true, true, false, 1980, 1345, 4.7, 198),

  ('00000000-0000-4000-8000-0000000000p6', 'Gemini Prompt Pack Pro', 'gemini-prompt-pack-pro',
   '200 prompts built for Google Gemini — multimodal, research and productivity prompts.',
   'Gemini shines with multimodal and research tasks — these 200 prompts are engineered for exactly that. Image analysis, YouTube summaries, Google Workspace automation, Deep Research briefs and everyday productivity prompts.',
   '00000000-0000-4000-8000-0000000000c1',
   750, null,
   'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=75',
   'products/gemini-prompt-pack-pro.zip', '2.1 MB', 'PDF',
   array['gemini','google','ai','prompts'],
   array['200 prompts tested on latest Gemini models','Multimodal prompts for images & video','Research brief templates','Google Docs/Sheets automation prompts'],
   array['70-page prompt guide','15 multimodal worked examples','Workspace automation cheat sheet'],
   true, true, true, true, 890, 610, 4.8, 88),

  ('00000000-0000-4000-8000-0000000000p7', 'Instagram Reels & Stories Template Pack', 'instagram-reels-stories-template-pack',
   '120 viral-style reels covers, story templates and highlight icons.',
   'Grow faster with scroll-stopping visuals. 120 templates covering reels covers, story sequences, highlight icons and CTA slides — designed around proven Kenyan engagement patterns. Editable in free Canva.',
   '00000000-0000-4000-8000-0000000000c4',
   999, 699,
   'https://images.unsplash.com/photo-1611926653458-09294b3142bf?auto=format&fit=crop&w=900&q=75',
   'products/instagram-reels-stories-pack.zip', '11 MB', 'Canva Links',
   array['instagram','reels','social-media'],
   array['120 reels & story templates','40 highlight icon sets','Hook + CTA slide formulas','Editable in free Canva'],
   array['80 reels cover templates','40 story sequence templates','Highlight icons pack','Reels hook ideas PDF (100 hooks)'],
   true, true, false, true, 720, 495, 4.7, 64),

  ('00000000-0000-4000-8000-0000000000p8', 'Invoice & Quotation Templates (Kenya Edition)', 'invoice-quotation-templates-kenya',
   'Professional invoices, quotations and receipts with KRA PIN and M-Pesa payment lines.',
   'Get paid faster with clean, professional documents. Invoice, quotation, delivery note and receipt templates with Kenyan essentials baked in: KRA PIN field, M-Pesa payment instructions, VAT calculations and automatic totals.',
   '00000000-0000-4000-8000-0000000000c7',
   850, 590,
   'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=75',
   'products/invoice-quotation-templates.zip', '3.6 MB', 'XLSX + DOCX + Canva',
   array['invoice','business','mpesa','kenya'],
   array['Auto-calculating invoice spreadsheet','KRA PIN & VAT fields pre-built','M-Pesa payment instruction blocks','Matching quotation + receipt designs'],
   array['3 invoice designs (XLSX + DOCX)','Quotation + proforma templates','Receipt & delivery note templates','Branding guide'],
   true, false, false, false, 1430, 1010, 4.6, 132),

  ('00000000-0000-4000-8000-0000000000p9', 'Canva Presentation Templates Pro', 'canva-presentation-templates-pro',
   '80 stunning slide templates for pitch decks, school projects and client proposals.',
   'Never build a boring deck again. 80 premium slide layouts covering title slides, data visualisation, timelines, team intros and closing CTAs. Perfect for pitch decks, client proposals and school projects.',
   '00000000-0000-4000-8000-0000000000c2',
   1300, null,
   'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=75',
   'products/canva-presentation-templates-pro.zip', '14 MB', 'Canva Links + PDF',
   array['canva','presentation','pitch-deck'],
   array['80 slide layouts in 4 themes','Charts, timelines & comparison slides','Speaker notes starter text','16:9 and 4:3 sizes included'],
   array['4 full deck themes (20 slides each)','Icon & illustration library','Deck structure guide PDF'],
   true, true, false, false, 980, 690, 4.8, 95),

  ('00000000-0000-4000-8000-0000000001p0', 'The AI Side Hustle Playbook', 'the-ai-side-hustle-playbook',
   'A step-by-step eBook on earning with AI in Kenya — 7 real side hustles.',
   'The practical, no-fluff guide to earning with AI in Kenya. Learn 7 proven side hustles — content writing, prompt packs, social media management, tutoring bots and more — with exact tools, pricing tables in KES, client scripts and M-Pesa invoicing tips.',
   '00000000-0000-4000-8000-0000000000c3',
   650, null,
   'https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?auto=format&fit=crop&w=900&q=75',
   'products/ai-side-hustle-playbook.pdf', '5.8 MB', 'PDF eBook',
   array['ebook','ai','side-hustle','money'],
   array['7 AI side hustles broken down step by step','Pricing tables in KES','Client outreach scripts that get replies','Tool stack guide (free tiers first)'],
   array['140-page eBook','Bonus: 30-day launch checklist','Resource links vault'],
   true, true, false, true, 540, 388, 4.9, 52),

  ('00000000-0000-4000-8000-0000000001p1', 'KCPE Revision Mega Pack 2024', 'kcpe-revision-mega-pack-2024',
   'Complete KCPE revision set: topical questions, past papers and composition guides.',
   'Give your Class 8 candidate the best start. Topical revision questions for all subjects, 12 years of KCPE past papers with marking schemes, essay and composition guides, plus a parent-supported revision timetable.',
   '00000000-0000-4000-8000-0000000000c5',
   1200, null,
   'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=75',
   'products/kcpe-revision-mega-pack.zip', '86 MB', 'PDF',
   array['kcpe','education','revision'],
   array['Topical questions for all subjects','Past papers 2012-2023 with schemes','Composition & essay frameworks','Parent revision support guide'],
   array['Topical revision set (400+ pages)','Past papers archive','Mock exams with marking schemes'],
   true, false, false, false, 1210, 860, 4.8, 110),

  ('00000000-0000-4000-8000-0000000001p2', 'Notion Productivity OS', 'notion-productivity-os',
   'An all-in-one Notion workspace: goals, finances, M-Pesa expense tracker and habits.',
   'Run your entire life from one Notion dashboard. Includes goal tracking, a KES finance tracker with M-Pesa expense categories, a content calendar for creators, habit streaks and a weekly review system.',
   '00000000-0000-4000-8000-0000000000c6',
   900, 600,
   'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=900&q=75',
   'products/notion-productivity-os.zip', '1.2 MB', 'Notion Template',
   array['notion','productivity','planner'],
   array['All-in-one dashboard (goals, money, content)','KES finance + M-Pesa expense tracker','Content calendar with post status pipeline','Habit streaks & weekly review system'],
   array['Notion template duplicate link','Setup video walkthrough (25 min)','Beginner Notion guide PDF'],
   true, true, false, false, 760, 540, 4.7, 73)
on conflict (id) do nothing;

-- Seed rows are fixtures only. Publish verified products from /admin/products.
update public.products
set is_published = false, is_featured = false, is_best_seller = false, is_new = false
where id like '00000000-0000-4000-8000-0000000000p%'
   or id like '00000000-0000-4000-8000-0000000001p%';

-- ─── BUNDLES ───────────────────────────────────────────────────────
insert into public.bundles (id, title, slug, description, thumbnail_url, original_price, bundle_price, is_published, is_featured) values
  ('00000000-0000-4000-8000-0000000000b1', 'Creator Starter Bundle', 'creator-starter-bundle',
   'Everything a new content creator needs: AI prompts, Canva templates and a productivity system — 5 products, one price.',
   'https://images.unsplash.com/photo-1611926653458-09294b3142bf?auto=format&fit=crop&w=900&q=75',
   3500, 1800, true, true),
  ('00000000-0000-4000-8000-0000000000b2', 'Ultimate Business Bundle', 'ultimate-business-bundle',
   'Our most popular bundle. 8 premium products covering AI, documents, invoicing and strategy for serious business growth.',
   'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=75',
   7200, 3200, true, true),
  ('00000000-0000-4000-8000-0000000000b3', 'Student Success Bundle', 'student-success-bundle',
   'Ace your exams and organise your life: KCSE & KCPE revision packs plus study-friendly productivity tools.',
   'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=75',
   4500, 1500, true, true)
on conflict (id) do nothing;

update public.bundles
set is_published = false, is_featured = false
where id in (
  '00000000-0000-4000-8000-0000000000b1',
  '00000000-0000-4000-8000-0000000000b2',
  '00000000-0000-4000-8000-0000000000b3'
);

insert into public.bundle_products (bundle_id, product_id, sort_order) values
  -- Creator Starter Bundle
  ('00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000000p1', 1),
  ('00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000000p2', 2),
  ('00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000000p7', 3),
  ('00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000000p9', 4),
  ('00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000001p2', 5),
  -- Ultimate Business Bundle
  ('00000000-0000-4000-8000-0000000000b2', '00000000-0000-4000-8000-0000000000p1', 1),
  ('00000000-0000-4000-8000-0000000000b2', '00000000-0000-4000-8000-0000000000p4', 2),
  ('00000000-0000-4000-8000-0000000000b2', '00000000-0000-4000-8000-0000000000p6', 3),
  ('00000000-0000-4000-8000-0000000000b2', '00000000-0000-4000-8000-0000000000p5', 4),
  ('00000000-0000-4000-8000-0000000000b2', '00000000-0000-4000-8000-0000000000p8', 5),
  ('00000000-0000-4000-8000-0000000000b2', '00000000-0000-4000-8000-0000000000p9', 6),
  ('00000000-0000-4000-8000-0000000000b2', '00000000-0000-4000-8000-0000000001p0', 7),
  ('00000000-0000-4000-8000-0000000000b2', '00000000-0000-4000-8000-0000000001p2', 8),
  -- Student Success Bundle
  ('00000000-0000-4000-8000-0000000000b3', '00000000-0000-4000-8000-0000000000p3', 1),
  ('00000000-0000-4000-8000-0000000000b3', '00000000-0000-4000-8000-0000000001p1', 2),
  ('00000000-0000-4000-8000-0000000000b3', '00000000-0000-4000-8000-0000000001p0', 3),
  ('00000000-0000-4000-8000-0000000000b3', '00000000-0000-4000-8000-0000000001p2', 4),
  ('00000000-0000-4000-8000-0000000000b3', '00000000-0000-4000-8000-0000000000p1', 5),
  ('00000000-0000-4000-8000-0000000000b3', '00000000-0000-4000-8000-0000000000p6', 6)
on conflict (bundle_id, product_id) do nothing;

-- ─── COUPONS ───────────────────────────────────────────────────────
insert into public.coupons (code, description, discount_type, discount_value, minimum_order, maximum_discount, usage_limit, is_active) values
  ('WELCOME20', 'Welcome offer: 20% off your first order (max KES 1,000).', 'percentage', 20, 0, 1000, 5000, true),
  ('NEWUSER', 'KES 100 off any order above KES 500 for new customers.', 'fixed', 100, 500, null, 3000, true)
on conflict (code) do nothing;

-- ─── BLOG POSTS ────────────────────────────────────────────────────
insert into public.blog_posts (
  title, slug, excerpt, content, cover_image_url, category, tags,
  is_published, is_featured, view_count, read_time, published_at
) values
  ('10 ChatGPT Prompts Every Kenyan Entrepreneur Needs', '10-chatgpt-prompts-kenyan-entrepreneur',
   'From writing WhatsApp business replies to planning your next product launch — these 10 prompts will save you hours this week.',
   '<p>Most entrepreneurs in Kenya use ChatGPT like a search engine. That works, but it leaves 90% of the value on the table. The difference between a mediocre answer and a brilliant one is almost always the prompt.</p><h2>1. The M-Pesa follow-up message</h2><p>Ask ChatGPT to write three polite payment follow-up messages for different stages: 3 days overdue, 7 days overdue, and final notice.</p><h2>2. The product description generator</h2><p>Paste your product details and ask for five descriptions: one for WhatsApp status, one for Instagram, one for a website, one for a flyer, and one for a radio mention.</p><h2>3. The tender summariser</h2><p>Upload a tender document and ask ChatGPT to list the requirements, deadlines and disqualifying criteria in a table.</p><h2>Start today</h2><p>These three prompts alone save our users an average of six hours per week. Our Ultimate ChatGPT Prompt Pack 500 includes 497 more.</p>',
   'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=75',
   'AI & Prompts', array['chatgpt','prompts','business'], false, false, 0, 6, '2026-07-18T08:00:00Z'),

  ('How to Use Canva Like a Pro: Complete Beginner Guide', 'how-to-use-canva-like-a-pro',
   'You do not need a design degree to create stunning content. This guide walks you through Canva from zero to confident.',
   '<p>Canva has quietly become the most powerful free tool for Kenyan creators and small businesses.</p><h2>Start with templates, not blank canvases</h2><p>Search for the format you need, pick a template close to your vision, then customise colours, fonts and photos.</p><h2>Lock a two-font system</h2><p>Choose one bold font for headings and one clean font for body text. Consistency is what makes a brand look expensive.</p><h2>Use the Brand Kit</h2><p>Save your logo, your three brand colours, and your two fonts. Every design becomes a five-minute job.</p><h2>Practice with our templates</h2><p>The fastest way to learn is to edit real designs. Our Canva Social Media Mega Pack gives you 300+ professional templates.</p>',
   'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=900&q=75',
   'Design', array['canva','design','tutorial'], false, false, 0, 8, '2026-07-10T08:00:00Z'),

  ('AI Tools That Are Changing How Kenyans Do Business', 'ai-tools-changing-kenyan-business',
   'M-Pesa changed payments. AI is changing everything else. Here are the tools Kenyan businesses are actually using in 2026.',
   '<p>Five years ago, talking about AI in a Kenyan boardroom sounded futuristic. Today, a mama mboga with a smartphone can use the same tools as a Fortune 500 company.</p><h2>ChatGPT for customer communication</h2><p>Businesses use it to draft WhatsApp replies, product descriptions and marketing copy in seconds.</p><h2>Canva AI for marketing at scale</h2><p>One person can now produce a month of social content in an afternoon.</p><h2>Gemini for research</h2><p>Deep Research briefs that used to take consultants weeks now take minutes.</p><h2>The takeaway</h2><p>Pick one workflow — customer replies, content creation, or research — and build a prompt system around it.</p>',
   'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=75',
   'AI & Prompts', array['ai','business','tools'], true, true, 8710, 7, '2026-06-28T08:00:00Z'),

  ('How to Sell Digital Products in Kenya with M-Pesa', 'sell-digital-products-kenya-mpesa',
   'The complete playbook: what to sell, how to price in KES, and how to deliver instantly after an M-Pesa payment.',
   '<p>Digital products are the best business model in Kenya: zero rent, zero shipping, zero stock.</p><h2>What sells best</h2><p>Templates, prompt packs, study materials and eBooks consistently outperform everything else.</p><h2>Pricing in KES</h2><p>The sweet spot is KES 500 to KES 1,500. Bundles let you raise average order value to KES 3,000+.</p><h2>Instant delivery wins</h2><p>Customers expect their download seconds after the M-Pesa message arrives.</p><h2>Start this week</h2><p>Package knowledge you already have into a PDF or template, price it at KES 799, and sell it.</p>',
   'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=75',
   'Business', array['digital-products','mpesa','selling'], true, false, 7325, 9, '2026-06-15T08:00:00Z'),

  ('KCSE 2024 Study Plan: A 30-Day Revision Timetable', 'kcse-30-day-revision-timetable',
   'A realistic, examiner-approved 30-day revision plan that covers all eight subjects without burnout.',
   '<p>Cramming does not work. A structured 30-day plan does.</p><h2>Week 1: Foundations</h2><p>Spend two days per your weakest three subjects. Topical notes first, then ten past-paper questions per topic.</p><h2>Week 2: Past papers</h2><p>One full past paper per subject under timed conditions.</p><h2>Week 3: Gaps and marking schemes</h2><p>Revisit every question you got wrong. Study the marking scheme itself.</p><h2>Week 4: Exam simulation</h2><p>Prediction papers, early nights, and light review only.</p><h2>Get the materials</h2><p>Our Kenya KCSE Study Bundle includes the topical notes, 10 years of past papers with schemes, and a printable version of this timetable.</p>',
   'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=75',
   'Education', array['kcse','study','timetable'], true, false, 11208, 5, '2026-06-02T08:00:00Z'),

  ('From Side Hustle to Full-Time: Growing Your Creative Business', 'side-hustle-to-full-time-creative-business',
   'The honest roadmap for quitting your job to create full-time — including the numbers you need before you leap.',
   '<p>Everyone wants to go full-time with their creative work. Almost everyone does it too early or too late.</p><h2>The 75% rule</h2><p>Do not quit until your side income covers 75% of your salary for three consecutive months.</p><h2>Build systems, not just content</h2><p>Full-time creators need delivery systems, email lists, and repeatable products.</p><h2>Productise your knowledge</h2><p>Take your most-asked question and turn it into a product.</p><h2>Keep your runway</h2><p>Have three months of expenses saved before you resign.</p>',
   'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=75',
   'Business', array['creators','side-hustle','growth'], true, false, 5890, 10, '2026-05-20T08:00:00Z')
on conflict (slug) do nothing;

-- Legacy demo duplicates are kept only for reference and never published.
update public.blog_posts
set is_published = false, is_featured = false, updated_at = now()
where slug in ('10-chatgpt-prompts-kenyan-entrepreneur', 'how-to-use-canva-like-a-pro');
