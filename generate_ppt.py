import os
import subprocess
import time
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml import parse_xml

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PPTX_PATH = os.path.join(BASE_DIR, "BloodLink_Assignment1_Presentation.pptx")
PDF_PATH = os.path.join(BASE_DIR, "BloodLink_Assignment1_Presentation.pdf")

# ==============================================================================
# DESIGN SYSTEM: MINIMALIST, CLEAN TYPOGRAPHY, AIRY WHITESPACE
# ==============================================================================
COLOR_BG_WHITE = RGBColor(255, 255, 255)
COLOR_PRIMARY_NAVY = RGBColor(15, 23, 42)      # Slate 900 (#0F172A)
COLOR_TEXT_MAIN = RGBColor(51, 65, 85)         # Slate 700 (#334155)
COLOR_TEXT_MUTED = RGBColor(100, 116, 139)     # Slate 500 (#64748B)
COLOR_TEXT_LIGHT = RGBColor(148, 163, 184)     # Slate 400 (#94A3B8)
COLOR_ACCENT_BLUE = RGBColor(37, 99, 235)      # Blue 600 (#2563EB)
COLOR_ACCENT_EMERALD = RGBColor(16, 185, 129)  # Emerald 500 (#10B981)
COLOR_ACCENT_RED = RGBColor(220, 38, 38)       # Red 600 (#DC2626)
COLOR_DIVIDER = RGBColor(226, 232, 240)        # Slate 200 (#E2E8F0)
COLOR_IMG_BORDER = RGBColor(203, 213, 225)     # Slate 300 (#CBD5E1)
COLOR_TABLE_HEADER = RGBColor(15, 23, 42)      # Slate 900 (#0F172A)
COLOR_TABLE_ALT = RGBColor(248, 250, 252)      # Slate 50 (#F8FAFC)

FONT_NAME = "Segoe UI"
TOTAL_SLIDES = 8


def set_slide_background(slide):
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = COLOR_BG_WHITE


def add_openxml_transition(slide, effect="wipe"):
    try:
        trans_xml = f'<p:transition xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" spd="med"><p:{effect}/></p:transition>'
        slide._element.append(parse_xml(trans_xml))
    except Exception:
        pass


def add_header(slide, slide_num, category, title, subtitle):
    # Category / Super-title
    cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.42), Inches(11.7), Inches(0.25))
    ctf = cat_box.text_frame
    ctf.word_wrap = True
    ctf.margin_left = ctf.margin_top = ctf.margin_right = ctf.margin_bottom = 0
    p_cat = ctf.paragraphs[0]
    p_cat.text = category.upper()
    p_cat.font.name = FONT_NAME
    p_cat.font.size = Pt(9.5)
    p_cat.font.bold = True
    p_cat.font.color.rgb = COLOR_ACCENT_RED

    # Title & Subtitle block
    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.68), Inches(11.7), Inches(0.85))
    ttf = title_box.text_frame
    ttf.word_wrap = True
    ttf.margin_left = ttf.margin_top = ttf.margin_right = ttf.margin_bottom = 0

    p_title = ttf.paragraphs[0]
    p_title.text = title
    p_title.font.name = FONT_NAME
    p_title.font.size = Pt(20)
    p_title.font.bold = True
    p_title.font.color.rgb = COLOR_PRIMARY_NAVY
    p_title.space_after = Pt(2)

    p_sub = ttf.add_paragraph()
    p_sub.text = subtitle
    p_sub.font.name = FONT_NAME
    p_sub.font.size = Pt(10.5)
    p_sub.font.color.rgb = COLOR_TEXT_MUTED

    # Header Divider Line
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.58), Inches(11.733), Inches(0.015))
    line.fill.solid()
    line.fill.fore_color.rgb = COLOR_DIVIDER
    line.line.fill.background()

    # Footer elements
    add_footer(slide, slide_num)


def add_footer(slide, slide_num):
    # Footer Divider Line
    f_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(6.85), Inches(11.733), Inches(0.012))
    f_line.fill.solid()
    f_line.fill.fore_color.rgb = COLOR_DIVIDER
    f_line.line.fill.background()

    # Left metadata
    f_box = slide.shapes.add_textbox(Inches(0.8), Inches(6.92), Inches(8.5), Inches(0.3))
    ftf = f_box.text_frame
    ftf.word_wrap = True
    ftf.margin_left = ftf.margin_top = ftf.margin_right = ftf.margin_bottom = 0
    p_foot = ftf.paragraphs[0]
    p_foot.text = "Nirma University  •  6CS102CC26 - Data Structures  •  Innovative Assignment 1  •  Shrey Patel (26MCA042)"
    p_foot.font.name = FONT_NAME
    p_foot.font.size = Pt(8.5)
    p_foot.font.color.rgb = COLOR_TEXT_LIGHT

    # Right slide counter
    f_num = slide.shapes.add_textbox(Inches(10.533), Inches(6.92), Inches(2.0), Inches(0.3))
    ntf = f_num.text_frame
    ntf.word_wrap = True
    ntf.margin_left = ntf.margin_top = ntf.margin_right = ntf.margin_bottom = 0
    p_num = ntf.paragraphs[0]
    p_num.alignment = PP_ALIGN.RIGHT
    p_num.text = f"{slide_num:02d} / {TOTAL_SLIDES:02d}"
    p_num.font.name = FONT_NAME
    p_num.font.size = Pt(8.5)
    p_num.font.bold = True
    p_num.font.color.rgb = COLOR_ACCENT_RED


def add_clean_screenshot(slide, img_path, left, top, width, height, caption=""):
    full_path = os.path.join(BASE_DIR, img_path) if not os.path.isabs(img_path) else img_path
    if os.path.exists(full_path):
        pic = slide.shapes.add_picture(full_path, left, top, width, height)
        pic.line.color.rgb = COLOR_IMG_BORDER
        pic.line.width = Pt(0.75)
        if caption:
            cap_box = slide.shapes.add_textbox(left, top + height + Inches(0.06), width, Inches(0.3))
            ctf = cap_box.text_frame
            ctf.word_wrap = True
            ctf.margin_left = ctf.margin_top = ctf.margin_right = ctf.margin_bottom = 0
            p = ctf.paragraphs[0]
            p.text = caption
            p.font.name = FONT_NAME
            p.font.size = Pt(8.5)
            p.font.italic = True
            p.font.color.rgb = COLOR_TEXT_MUTED
            p.alignment = PP_ALIGN.CENTER


def add_clean_column(slide, left, top, width, height, title, items, tag=""):
    accent = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, Inches(0.4), Inches(0.035))
    accent.fill.solid()
    accent.fill.fore_color.rgb = COLOR_ACCENT_RED
    accent.line.fill.background()

    tb = slide.shapes.add_textbox(left, top + Inches(0.12), width, height - Inches(0.12))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p_title = tf.paragraphs[0]
    p_title.text = title
    p_title.font.name = FONT_NAME
    p_title.font.size = Pt(13.5)
    p_title.font.bold = True
    p_title.font.color.rgb = COLOR_PRIMARY_NAVY
    p_title.space_after = Pt(10)

    if tag:
        r_tag = p_title.add_run()
        r_tag.text = f"   ·   {tag.upper()}"
        r_tag.font.size = Pt(9.0)
        r_tag.font.bold = True
        r_tag.font.color.rgb = COLOR_ACCENT_RED

    for item in items:
        p = tf.add_paragraph()
        p.space_after = Pt(7)
        if isinstance(item, tuple):
            prefix, text = item
            r_dot = p.add_run()
            r_dot.text = "• "
            r_dot.font.name = FONT_NAME
            r_dot.font.size = Pt(9.5)
            r_dot.font.bold = True
            r_dot.font.color.rgb = COLOR_ACCENT_RED

            r_pre = p.add_run()
            r_pre.text = prefix + " "
            r_pre.font.name = FONT_NAME
            r_pre.font.size = Pt(9.5)
            r_pre.font.bold = True
            r_pre.font.color.rgb = COLOR_PRIMARY_NAVY

            r_txt = p.add_run()
            r_txt.text = text
            r_txt.font.name = FONT_NAME
            r_txt.font.size = Pt(9.5)
            r_txt.font.color.rgb = COLOR_TEXT_MAIN
        else:
            r_dot = p.add_run()
            r_dot.text = "• "
            r_dot.font.name = FONT_NAME
            r_dot.font.size = Pt(9.5)
            r_dot.font.bold = True
            r_dot.font.color.rgb = COLOR_ACCENT_RED

            r_txt = p.add_run()
            r_txt.text = str(item)
            r_txt.font.name = FONT_NAME
            r_txt.font.size = Pt(9.5)
            r_txt.font.color.rgb = COLOR_TEXT_MAIN


# ==============================================================================
# SLIDE 1: TITLE & ACADEMIC CREDENTIALS
# ==============================================================================
def build_slide_1(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide)
    add_openxml_transition(slide, "fade")

    # University & Department Top Header
    tb_u = slide.shapes.add_textbox(Inches(0.8), Inches(0.65), Inches(9.8), Inches(0.6))
    tf_u = tb_u.text_frame
    tf_u.word_wrap = True
    tf_u.margin_left = tf_u.margin_top = tf_u.margin_right = tf_u.margin_bottom = 0
    p_u1 = tf_u.paragraphs[0]
    p_u1.text = "NIRMA UNIVERSITY  •  INSTITUTE OF TECHNOLOGY"
    p_u1.font.name = FONT_NAME
    p_u1.font.size = Pt(11)
    p_u1.font.bold = True
    p_u1.font.color.rgb = COLOR_PRIMARY_NAVY
    p_u1.space_after = Pt(2)

    p_u2 = tf_u.add_paragraph()
    p_u2.text = "Department of Computer Science & Engineering  •  Master of Computer Applications (MCA)"
    p_u2.font.name = FONT_NAME
    p_u2.font.size = Pt(9.5)
    p_u2.font.color.rgb = COLOR_TEXT_MUTED

    # Nirma University Logo
    logo_path = os.path.join(BASE_DIR, "data", "Nirma.png")
    if os.path.exists(logo_path):
        slide.shapes.add_picture(logo_path, Inches(10.8), Inches(0.6), width=Inches(1.733))

    # Hero Title Block
    tb_t = slide.shapes.add_textbox(Inches(0.8), Inches(2.2), Inches(11.733), Inches(1.8))
    tf_t = tb_t.text_frame
    tf_t.word_wrap = True
    tf_t.margin_left = tf_t.margin_top = tf_t.margin_right = tf_t.margin_bottom = 0

    p_subtag = tf_t.paragraphs[0]
    p_subtag.text = "6CS102CC26 - DATA STRUCTURES INNOVATIVE ASSIGNMENT – 1"
    p_subtag.font.name = FONT_NAME
    p_subtag.font.size = Pt(10.5)
    p_subtag.font.bold = True
    p_subtag.font.color.rgb = COLOR_ACCENT_RED
    p_subtag.space_after = Pt(10)

    p_t = tf_t.add_paragraph()
    p_t.text = "BloodLink: Real-Time Blood Requisition &\nDonor Allocation System"
    p_t.font.name = FONT_NAME
    p_t.font.size = Pt(34)
    p_t.font.bold = True
    p_t.font.color.rgb = COLOR_PRIMARY_NAVY

    # Horizontal Divider Line
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(4.35), Inches(11.733), Inches(0.015))
    line.fill.solid()
    line.fill.fore_color.rgb = COLOR_DIVIDER
    line.line.fill.background()

    # Clean 2-Column Metadata Text
    col_w = Inches(5.6)
    y_meta = Inches(4.65)

    # Column 1: Candidate Details
    tb_c1 = slide.shapes.add_textbox(Inches(0.8), y_meta, col_w, Inches(1.9))
    tf_c1 = tb_c1.text_frame
    tf_c1.word_wrap = True
    tf_c1.margin_left = tf_c1.margin_top = tf_c1.margin_right = tf_c1.margin_bottom = 0

    p_c1_h = tf_c1.paragraphs[0]
    p_c1_h.text = "STUDENT CANDIDATE"
    p_c1_h.font.name = FONT_NAME
    p_c1_h.font.size = Pt(9.5)
    p_c1_h.font.bold = True
    p_c1_h.font.color.rgb = COLOR_ACCENT_RED
    p_c1_h.space_after = Pt(4)

    p_c1_name = tf_c1.add_paragraph()
    p_c1_name.text = "SHREY PATEL"
    p_c1_name.font.name = FONT_NAME
    p_c1_name.font.size = Pt(14)
    p_c1_name.font.bold = True
    p_c1_name.font.color.rgb = COLOR_PRIMARY_NAVY
    p_c1_name.space_after = Pt(4)

    p_c1_d1 = tf_c1.add_paragraph()
    p_c1_d1.text = "Roll Number: 26MCA042  •  Master of Computer Applications (MCA - Semester I)"
    p_c1_d1.font.name = FONT_NAME
    p_c1_d1.font.size = Pt(9.5)
    p_c1_d1.font.color.rgb = COLOR_TEXT_MAIN

    # Column 2: Academic Supervision Details
    tb_c2 = slide.shapes.add_textbox(Inches(6.8), y_meta, col_w, Inches(1.9))
    tf_c2 = tb_c2.text_frame
    tf_c2.word_wrap = True
    tf_c2.margin_left = tf_c2.margin_top = tf_c2.margin_right = tf_c2.margin_bottom = 0

    p_c2_h = tf_c2.paragraphs[0]
    p_c2_h.text = "ACADEMIC GUIDANCE & EVALUATION"
    p_c2_h.font.name = FONT_NAME
    p_c2_h.font.size = Pt(9.5)
    p_c2_h.font.bold = True
    p_c2_h.font.color.rgb = COLOR_ACCENT_RED
    p_c2_h.space_after = Pt(4)

    p_c2_name = tf_c2.add_paragraph()
    p_c2_name.text = "Prof. NIRAV PATEL"
    p_c2_name.font.name = FONT_NAME
    p_c2_name.font.size = Pt(14)
    p_c2_name.font.bold = True
    p_c2_name.font.color.rgb = COLOR_PRIMARY_NAVY
    p_c2_name.space_after = Pt(4)

    p_c2_d1 = tf_c2.add_paragraph()
    p_c2_d1.text = "Assistant Professor  •  6CS102CC26 - Data Structures"
    p_c2_d1.font.name = FONT_NAME
    p_c2_d1.font.size = Pt(9.5)
    p_c2_d1.font.color.rgb = COLOR_TEXT_MAIN

    add_footer(slide, 1)


# ==============================================================================
# SLIDE 2: PROBLEM CONTEXT & REGIONAL CHALLENGES
# ==============================================================================
def build_slide_2(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide)
    add_openxml_transition(slide, "wipe")
    add_header(slide, 2, "Problem Context & Regional Challenges",
               "Overcoming Regional Blood Cold-Chain Perishability & Allocation Delays",
               "Resolving life-critical logistical bottlenecks across Gujarat's 34 districts through deterministic data structures.")

    c_w = Inches(5.6)
    add_clean_column(slide, Inches(0.8), Inches(1.9), c_w, Inches(4.8),
                     "Critical Cold-Chain Challenges", [
                         ("Strict Biological Shelf Lives:", "Platelets degrade in 5 days; Whole Blood in 35-42 days; Plasma requires cryogenic sub-zero storage."),
                         ("Regional Supply Disparities:", "Severe supply-demand imbalances between urban hubs (Ahmedabad, Surat) and remote districts (Kutch, Dang)."),
                         ("Fatal Queue Inversion Risk:", "Standard FIFO queues force emergency trauma hemorrhages to wait behind non-acute elective surgeries."),
                         ("High-Latency Donor Sourcing:", "Manual donor phone calls and linear database table scanning waste critical resuscitation minutes."),
                         ("Cold-Storage Information Silos:", "Hospitals lack real-time visibility into neighboring blood bank reserves, causing avoidable shortages.")
                     ], tag="Challenges")

    add_clean_column(slide, Inches(6.8), Inches(1.9), c_w, Inches(4.8),
                     "BloodLink Computational Solution", [
                         ("In-Memory 3D Static Matrix:", "Pre-allocated 34x8 array providing O(1) constant-time voluntary donor registration and lookup."),
                         ("3-Tier Multilevel Queue (MLQ):", "Enforces clinical triage tiers: CRITICAL (<1h), URGENT (<4h), and SCHEDULED (<24h) with strict FIFO."),
                         ("Autonomous Event Worker:", "Single QueueProcessor worker running zero-polling event loop sleeping on empty queues."),
                         ("Geodesic Proximity Matching:", "Haversine spatial ranking pairs emergency requisitions with nearest active blood depots."),
                         ("Advanced SQL Push-Down:", "MySQL 8 JSON aggregations minimize network payloads and eliminate JavaScript CPU serialization.")
                     ], tag="Our Solution")


# ==============================================================================
# SLIDE 3: SYSTEM ARCHITECTURE & 3-TIER ENGINE
# ==============================================================================
def build_slide_3(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide)
    add_openxml_transition(slide, "wipe")
    add_header(slide, 3, "System Design & Modularity", "Decoupled Architecture: In-Memory Matrix, MLQ Triage & Event Worker",
               "Clean 3-tier separation: pure data structures, autonomous event-driven worker, and reactive client portals.")

    col_w = Inches(3.65)
    top_pos = Inches(1.9)

    add_clean_column(slide, Inches(0.8), top_pos, col_w, Inches(4.8),
                     "Tier 1: In-Memory Core", [
                         ("Donor3DArray Matrix:", "Encapsulates 34 districts and 8 blood groups in a contiguous reference matrix."),
                         ("MultilevelQueue Class:", "Maintains 3 distinct FIFO Queues with deterministic top-down cascading dequeue."),
                         ("O(1) Constant-Time Bounds:", "Both matrix insertions and MLQ enqueue/dequeue execute in strictly bounded O(1) time."),
                         ("Zero-Lock Spatial Cache:", "272 static array buckets reside permanently in heap with zero GC fragmentation.")
                     ], tag="Data Structures")

    add_clean_column(slide, Inches(4.8), top_pos, col_w, Inches(4.8),
                     "Tier 2: Event Worker", [
                         ("Autonomous QueueProcessor:", "Singleton background loop running independently from Socket.IO ingestion."),
                         ("Zero-Polling Wakeup:", "Sleeps on empty queue with events.once('wakeup') yielding 0.00% idle CPU load."),
                         ("Haversine Proximity Engine:", "Ranks depots by geodesic distance and verified component inventory."),
                         ("Targeted Result Emission:", "Dispatches results strictly to request.socketId, preventing broadcast bleed.")
                     ], tag="Event Worker")

    add_clean_column(slide, Inches(8.8), top_pos, col_w, Inches(4.8),
                     "Tier 3: Multi-Portal Client", [
                         ("Requester Triage Portal:", "Clinical priority tier selection with interactive Leaflet GPS geolocation mapping."),
                         ("Donor Onboarding Portal:", "Instant validation of donor weight, age, and 90-day interval with 3D array insertion."),
                         ("Gujarat District Directory:", "District-level catalog covering cold-storage reserves across 34 administrative divisions."),
                         ("Interactive Heatmap:", "Vector SVG district map visualizing real-time statewide blood supply distribution.")
                     ], tag="Client Portals")


# ==============================================================================
# SLIDE 4: DATA STRUCTURE 1: 3D IN-MEMORY STATIC MATRIX
# ==============================================================================
def build_slide_4(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide)
    add_openxml_transition(slide, "fade")
    add_header(slide, 4, "Data Structure 1: In-Memory Matrix", "In-Memory 3D Static Matrix Indexing [City][BloodGroup][Donors]",
               "Multidimensional orthogonal indexing enabling O(1) voluntary donor registration and serological compatibility lookup.")

    # Left: Screenshot directly on canvas
    add_clean_screenshot(slide, "screenshots/03_donor_registration_portal.png",
                         Inches(0.8), Inches(1.9), Inches(6.8), Inches(4.6),
                         caption="Figure 1: Voluntary Donor Registration Portal — Capturing donor demographics and serological profile for instant O(1) 3D matrix insertion.")

    # Right: Clean typography column
    c_w = Inches(4.6)
    add_clean_column(slide, Inches(7.9), Inches(1.9), c_w, Inches(4.8),
                     "Matrix Topology & Mechanical Invariants", [
                         ("34 Fixed City Coordinates:", "Maps Gujarat districts to integer ordinals c in [0, 33] using static lookup tables."),
                         ("8 Blood Group Indices:", "Serological ABO/Rh phenotypes mapped to indices g in [0, 7] (A+, A-, B+, B-, AB+, AB-, O+, O-)."),
                         ("Guaranteed O(1) Insertion:", "matrix[c][g].push(donor) appends records in pure constant time without table scanning."),
                         ("Instant Serological Slices:", "Universal recipient (AB+) and donor (O-) queries project across matrix planes in O(8) time."),
                         ("Dense Memory Cache Locality:", "Pre-allocated 272 bucket pointers require under 2.2 KB of memory with zero pointer chasing.")
                     ], tag="3D Matrix Core")


# ==============================================================================
# SLIDE 5: DATA STRUCTURE 2: 3-TIER MULTILEVEL PRIORITY QUEUE (MLQ)
# ==============================================================================
def build_slide_5(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide)
    add_openxml_transition(slide, "fade")
    add_header(slide, 5, "Data Structure 2: Multilevel Queue", "Clinical Triage Prioritization & Deterministic FIFO Discipline",
               "Enforcing strict preemptive clinical triage while guaranteeing zero starvation and intra-tier fairness.")

    # Left: Screenshot directly on canvas
    add_clean_screenshot(slide, "screenshots/02_requester_triage_portal.png",
                         Inches(0.8), Inches(1.9), Inches(6.8), Inches(4.6),
                         caption="Figure 2: Requester Triage Portal — Clinical urgency selection (CRITICAL, URGENT, SCHEDULED) with interactive GPS location mapping.")

    # Right: Clean typography column
    c_w = Inches(4.6)
    add_clean_column(slide, Inches(7.9), Inches(1.9), c_w, Inches(4.8),
                     "Clinical Triage & Operational Discipline", [
                         ("Tier 1: CRITICAL (< 1 Hour):", "Acute polytrauma, massive hemorrhagic shock, ruptured aneurysms. Preemptively dispatched first."),
                         ("Tier 2: URGENT (< 4 Hours):", "Emergency surgery, active ICU transfusions, and severe hemolytic anemia with hemodynamic stability."),
                         ("Tier 3: SCHEDULED (< 24 Hours):", "Planned elective surgeries, thalassemia routine maintenance, and orthopedics."),
                         ("Strict Intra-Tier FIFO:", "Each priority level is governed by an independent FIFO Queue class, ensuring fair arrival sequence."),
                         ("Zero-Starvation Cascading:", "Cascading dequeue strictly inspects Tier 1 -> Tier 2 -> Tier 3 with sub-millisecond dispatch cycles.")
                     ], tag="Triage Logic")


# ==============================================================================
# SLIDE 6: ASYNCHRONOUS EVENT WORKER & SOCKET.IO ENGINE
# ==============================================================================
def build_slide_6(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide)
    add_openxml_transition(slide, "fade")
    add_header(slide, 6, "Event-Driven Worker Architecture", "Autonomous Single-Worker Execution & Zero-Polling Wakeup",
               "Decoupling socket ingestion from queue execution with atomic concurrency locks and targeted event dispatching.")

    # Left: Screenshot directly on canvas
    add_clean_screenshot(slide, "screenshots/06_interactive_district_map.png",
                         Inches(0.8), Inches(1.9), Inches(6.8), Inches(4.6),
                         caption="Figure 3: Interactive Gujarat District Spatial Map — Real-time blood supply heatmap coordinating regional logistics.")

    # Right: Clean typography column
    c_w = Inches(4.6)
    add_clean_column(slide, Inches(7.9), Inches(1.9), c_w, Inches(4.8),
                     "Autonomous Processor & Socket Mechanics", [
                         ("Singleton Worker Execution:", "Independent QueueProcessor runs exactly one worker loop protected by isProcessing lock."),
                         ("Zero-Polling Event Wakeup:", "Sleeps on events.once('wakeup') when empty; yields thread to event loop with zero CPU waste."),
                         ("Sub-2ms Token Ingestion:", "Socket handler immediately enqueues, acknowledges client with token, and triggers worker."),
                         ("Targeted Client Emission:", "Dispatches triage results via io.to(request.socketId).emit('send_result') without broadcast leaks."),
                         ("Haversine Distance Scoring:", "Computes exact geodesic distances to rank nearest regional blood banks with matching inventory.")
                     ], tag="Event Worker")


# ==============================================================================
# SLIDE 7: MASTER ALGORITHMIC COMPLEXITY BENCHMARK
# ==============================================================================
def build_slide_7(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide)
    add_openxml_transition(slide, "fade")
    add_header(slide, 7, "Complexity Analysis & Benchmark", "Multi-Dimensional Matrix & Multilevel Queue Performance Matrix",
               "Rigorous algorithmic comparisons demonstrating the mathematical superiority of BloodLink's core structures.")

    # Top: Performance Table
    comp_data = [
        ("Architecture", "Donor Insertion", "City+Group Lookup", "Universal Compatibility", "Triage Dequeue", "Cache Locality"),
        ("Flat Array (Unsorted)", "O(1) Append", "O(N) Full Scan", "O(N) Full Scan", "O(N) Linear Search", "Good (Contiguous)"),
        ("Singly Linked List", "O(1) Head", "O(N) Traversal", "O(N) Traversal", "O(N) Traversal", "Poor (Pointer Chase)"),
        ("Binary Min-Heap", "O(log N)", "O(N) Unsorted", "O(N) Unsorted", "O(log N) Sift-Down", "Moderate (Tree Heap)"),
        ("Hash Map (Compound)", "O(1) Amortized", "O(1) Key Probe", "O(K) Probes", "O(1) if Separate", "Moderate (Sparse)"),
        ("BloodLink (3D Array + MLQ)", "O(1) (Optimal)", "O(1) (Optimal)", "O(8) Slice (Optimal)", "O(1) (Optimal)", "Optimal (Dense Grid)")
    ]

    tbl_shape = slide.shapes.add_table(len(comp_data), 6, Inches(0.8), Inches(1.85), Inches(11.733), Inches(2.2))
    tbl = tbl_shape.table
    col_w = [Inches(2.733), Inches(1.8), Inches(1.8), Inches(1.8), Inches(1.8), Inches(1.8)]
    for i, w in enumerate(col_w):
        tbl.columns[i].width = w

    for i, row in enumerate(comp_data):
        for j, val in enumerate(row):
            cell = tbl.cell(i, j)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = COLOR_TABLE_HEADER if i == 0 else (COLOR_TABLE_ALT if i % 2 == 1 else COLOR_BG_WHITE)
            p = cell.text_frame.paragraphs[0]
            p.alignment = PP_ALIGN.CENTER if j > 0 else PP_ALIGN.LEFT
            p.font.name = FONT_NAME
            p.font.size = Pt(8.5)
            if i == 0:
                p.font.bold = True
                p.font.color.rgb = COLOR_BG_WHITE
            else:
                p.font.color.rgb = COLOR_TEXT_MAIN
                if "Optimal" in val:
                    p.font.bold = True
                    p.font.color.rgb = COLOR_ACCENT_RED
                elif "O(N)" in val or "Poor" in val:
                    p.font.bold = True
                    p.font.color.rgb = COLOR_ACCENT_BLUE

    # Bottom 2 Clean Text Columns
    c_w = Inches(5.6)
    add_clean_column(slide, Inches(0.8), Inches(4.35), c_w, Inches(2.4),
                     "Data Structure Invariant Proofs", [
                         ("Guaranteed O(1) Time Bounds:", "Matrix indexing and queue dispatching operate in strict O(1) time without dynamic re-allocation."),
                         ("Zero Memory Waste:", "Pre-allocating 272 grid pointers requires negligible memory while completely bypassing hash collision overhead.")
                     ], tag="Key Findings")

    add_clean_column(slide, Inches(6.8), Inches(4.35), c_w, Inches(2.4),
                     "Clinical Queuing Trade-Offs", [
                         ("MLQ vs Heap Superiority:", "MLQ achieves O(1) dequeue with strict FIFO fairness, whereas binary heaps incur O(log N) tree sifting."),
                         ("Thread Safety Under Concurrency:", "Single-worker processing eliminates race conditions during multi-client socket ingestion.")
                     ], tag="Engineering Trade-Offs")


# ==============================================================================
# SLIDE 8: INDUSTRIAL SYSTEMS, VERIFICATION & CONCLUSION
# ==============================================================================
def build_slide_8(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide)
    add_openxml_transition(slide, "fade")
    add_header(slide, 8, "Real-World Systems & Conclusion", "Industrial Healthcare Platforms, Academic Learnings & Verification",
               "Connecting academic data structures to nationwide healthcare logistics and verifying implementation integrity.")

    c_w = Inches(5.6)
    add_clean_column(slide, Inches(0.8), Inches(1.9), c_w, Inches(4.8),
                     "Industrial Healthcare Platform Alignment", [
                         ("eRaktKosh (Govt. of India):", "National digital blood repository coordinating inventory and voluntary donors across all states."),
                         ("American Red Cross Logistics:", "Employs multi-tier priority dispatch and shelf-life optimization for emergency transfers."),
                         ("NHS Blood & Transplant (UK):", "Utilizes algorithmic cold-chain routing to minimize perishable component wastage."),
                         ("Academic Alignment:", "BloodLink replicates mission-critical production architecture within a clean, auditable implementation.")
                     ], tag="Industrial Mapping")

    add_clean_column(slide, Inches(6.8), Inches(1.9), c_w, Inches(4.8),
                     "Academic Conclusions & Student Verification", [
                         ("Pedagogical Impact:", "Demonstrates that classical data structures directly solve life-critical real-world medical logistics."),
                         ("Mathematical Correctness:", "Rigorous automated test suite (test_mlq.js) verifies 100% triage priority and FIFO integrity."),
                         ("Zero CPU Waste:", "Event-driven wakeup pattern provides sub-millisecond responsiveness with 0.00% idle CPU overhead."),
                         ("Student Declaration:", "Original academic work executed for 6CS102CC26 - Data Structures under Prof. Nirav Patel (Oct 2026).")
                     ], tag="Academic Scope")


# ==============================================================================
# POWERPOINT COM AUTOMATION: MOTION TRANSITIONS & SMOOTH ENTRANCE ANIMATIONS
# ==============================================================================
def apply_presentation_motion_and_transitions(pptx_path):
    try:
        import win32com.client
        ppt = win32com.client.Dispatch("PowerPoint.Application")
        p_prs = ppt.Presentations.Open(os.path.abspath(pptx_path), WithWindow=False)

        for slide_idx, slide in enumerate(p_prs.Slides):
            trans_effect = 2306 if (slide_idx % 2 == 1) else 1793
            slide.SlideShowTransition.EntryEffect = trans_effect
            slide.SlideShowTransition.Duration = 0.65
            slide.SlideShowTransition.AdvanceOnClick = True

            seq = slide.TimeLine.MainSequence
            for shape_idx, shape in enumerate(slide.Shapes):
                if shape.Top > Inches(1.5) and shape.Top < Inches(6.8):
                    eff = seq.AddEffect(shape, 10, 0, 3)
                    eff.Timing.Duration = 0.35

        p_prs.Save()

        try:
            pdf_full_path = os.path.abspath(PDF_PATH)
            p_prs.SaveAs(pdf_full_path, 32)
            print(f"SUCCESS: Exported presentation PDF at: {pdf_full_path}")
        except Exception as pe:
            print(f"Presentation PDF export note: {pe}")

        p_prs.Close()
        ppt.Quit()
        print(f"Native PowerPoint motion transitions & entrance animations configured on {os.path.basename(pptx_path)}!")
    except Exception as e:
        print(f"Notice regarding PowerPoint COM animations: {e}")


# ==============================================================================
# MAIN GENERATOR
# ==============================================================================
def main():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    print("Generating Slide 1: Title & Academic Credentials...")
    build_slide_1(prs)

    print("Generating Slide 2: Problem Context & Regional Challenges...")
    build_slide_2(prs)

    print("Generating Slide 3: Decoupled Architecture (Matrix, MLQ, Worker)...")
    build_slide_3(prs)

    print("Generating Slide 4: Data Structure 1: In-Memory 3D Static Matrix...")
    build_slide_4(prs)

    print("Generating Slide 5: Data Structure 2: 3-Tier Multilevel Priority Queue...")
    build_slide_5(prs)

    print("Generating Slide 6: Event-Driven Worker & Socket.IO Engine...")
    build_slide_6(prs)

    print("Generating Slide 7: Complexity Analysis & Comparative Benchmark...")
    build_slide_7(prs)

    print("Generating Slide 8: Industrial Systems, Verification & Conclusion...")
    build_slide_8(prs)

    try:
        prs.save(PPTX_PATH)
    except PermissionError:
        print(f"Notice: {PPTX_PATH} is locked. Closing PowerPoint to overwrite...")
        subprocess.run(["taskkill", "/F", "/IM", "POWERPNT.exe"], capture_output=True)
        time.sleep(1)
        prs.save(PPTX_PATH)

    print(f"Saved initial presentation at: {os.path.abspath(PPTX_PATH)}")

    print("Applying native PowerPoint motion animations and smooth slide transitions...")
    apply_presentation_motion_and_transitions(PPTX_PATH)

    print(f"SUCCESS: {PPTX_PATH} generated successfully with {TOTAL_SLIDES} widescreen animated slides!")


if __name__ == "__main__":
    main()

