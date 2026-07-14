import os
import sys
import subprocess

# 1. Self-installer for dependencies
try:
    import pypdf
except ImportError:
    print("pypdf is not installed. Installing it now...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
        import pypdf
        print("pypdf installed successfully.")
    except Exception as e:
        print(f"Failed to install pypdf automatically: {e}")
        print("Please run: pip install pypdf")
        sys.exit(1)

from pypdf import PdfReader, PdfWriter

GIANCOLI_FILE = "Giancoli-Physics-Principles-with-Applications-7th-c2014-txtbk-1.pdf"
HRK_FILE = "hrk_physics.pdf"
OUTPUT_DIR = os.path.join("frontend", "public", "pdfs")

def check_files():
    """Verify that the source textbooks exist in the current directory."""
    files_ok = True
    if not os.path.exists(GIANCOLI_FILE):
        print(f"ERROR: Could not find Giancoli PDF at '{os.path.abspath(GIANCOLI_FILE)}'")
        files_ok = False
    if not os.path.exists(HRK_FILE):
        print(f"ERROR: Could not find HRK PDF at '{os.path.abspath(HRK_FILE)}'")
        files_ok = False
    return files_ok

def find_giancoli_offset(reader):
    """
    Search the first 60 pages of Giancoli for Chapter 2 title
    to calculate the offset: PDF_page = Book_page + offset.
    Book page 21 is the start of Chapter 2 (Kinematics in 1D).
    """
    print("Scanning Giancoli to find page offset...")
    target_text_1 = "Kinematics in One Dimension"
    target_text_2 = "Describing Motion"
    
    # Fallback default offset for Giancoli 7th edition is 34
    # (i.e. PDF page 35 is book page 1)
    fallback_offset = 34
    
    for i in range(min(100, len(reader.pages))):
        try:
            text = reader.pages[i].extract_text()
            if text and (target_text_1.lower() in text.lower() or target_text_2.lower() in text.lower()):
                # This is book page 21. Let's calculate offset.
                offset = i - 21
                print(f"  -> Found Chapter 2 at PDF page {i}. Calculated Giancoli offset: {offset}")
                return offset
        except Exception as e:
            continue
            
    print(f"  -> Could not locate Chapter 2 text. Using fallback offset: {fallback_offset}")
    return fallback_offset

def find_hrk_offset(reader):
    """
    Search the first 50 pages of HRK for Chapter 2 title.
    Chapter 2 is 'Motion Along a Straight Line' (book page 13) or similar.
    """
    print("Scanning HRK to find page offset...")
    target_text = "Motion Along a Straight Line"
    target_text_alt = "Position, Displacement"
    
    # Fallback default offset for HRK is 18 (PDF page 19 = book page 1)
    fallback_offset = 18
    
    for i in range(min(80, len(reader.pages))):
        try:
            text = reader.pages[i].extract_text()
            if text and (target_text.lower() in text.lower() or target_text_alt.lower() in text.lower()):
                # This is book page 13.
                offset = i - 13
                print(f"  -> Found Chapter 2 at PDF page {i}. Calculated HRK offset: {offset}")
                return offset
        except Exception as e:
            continue
            
    print(f"  -> Could not locate Chapter 2 text. Using fallback offset: {fallback_offset}")
    return fallback_offset

def extract_ranges_to_pdf(giancoli_reader, g_offset, hrk_reader, h_offset, day_specs, output_filename):
    """Extract page ranges from Giancoli and HRK and merge them into a single PDF."""
    writer = PdfWriter()
    
    added_pages = 0
    
    # Process Giancoli ranges
    g_ranges = day_specs.get("giancoli", [])
    if g_ranges and giancoli_reader:
        print(f"  Extracting Giancoli pages (offset: {g_offset}):")
        for start, end in g_ranges:
            pdf_start = start + g_offset
            pdf_end = end + g_offset
            print(f"    - Book pages {start}-{end} -> PDF pages {pdf_start}-{pdf_end}")
            
            # Bound check
            pdf_start = max(0, min(pdf_start, len(giancoli_reader.pages) - 1))
            pdf_end = max(0, min(pdf_end, len(giancoli_reader.pages) - 1))
            
            for p_idx in range(pdf_start, pdf_end + 1):
                writer.add_page(giancoli_reader.pages[p_idx])
                added_pages += 1
                
    # Process HRK ranges
    h_ranges = day_specs.get("hrk", [])
    if h_ranges and hrk_reader:
        print(f"  Extracting HRK pages (offset: {h_offset}):")
        for start, end in h_ranges:
            pdf_start = start + h_offset
            pdf_end = end + h_offset
            print(f"    - Book pages {start}-{end} -> PDF pages {pdf_start}-{pdf_end}")
            
            # Bound check
            pdf_start = max(0, min(pdf_start, len(hrk_reader.pages) - 1))
            pdf_end = max(0, min(pdf_end, len(hrk_reader.pages) - 1))
            
            for p_idx in range(pdf_start, pdf_end + 1):
                writer.add_page(hrk_reader.pages[p_idx])
                added_pages += 1
                
    if added_pages == 0:
        print(f"  No pages to extract for this day. Creating a placeholder or skipping.")
        return False
        
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_path = os.path.join(OUTPUT_DIR, output_filename)
    with open(out_path, "wb") as f_out:
        writer.write(f_out)
        
    print(f"  Saved combined PDF to '{out_path}' ({added_pages} pages)")
    return True

def main():
    print("=" * 60)
    print("PHYSICS PREP PDF EXTRACTION SCRIPT")
    print("=" * 60)
    
    if not check_files():
        print("\nPlease put the textbook PDFs in the project folder and try again.")
        print(f"Required filenames:\n  1. {GIANCOLI_FILE}\n  2. {HRK_FILE}")
        return

    print("Opening PDF files...")
    g_reader = PdfReader(GIANCOLI_FILE)
    h_reader = PdfReader(HRK_FILE)
    
    g_offset = find_giancoli_offset(g_reader)
    h_offset = find_hrk_offset(h_reader)
    
    # Define page specifications based on the 7-Day Battle Plan
    # Format: {"giancoli": [(start_page, end_page)], "hrk": [(start_page, end_page)]}
    # These are 1-based book page numbers.
    battle_plan_specs = {
        1: {
            "giancoli": [(21, 48)],  # Ch 2 Kinematics Solved Examples
            "hrk": []
        },
        2: {
            "giancoli": [
                (21, 68),   # Ch 2-3 Examples & Problems
                (69, 169),  # Ch 4-6 Examples, MisConceptual & Problems
                (184, 184)  # Ch 6 MisConceptual page
            ],
            "hrk": [
                (60, 63),   # Ch 2 Problems
                (80, 82),   # Ch 3 Review (including page 81)
                (106, 108)  # Ch 4 Review (including page 107)
            ]
        },
        3: {
            "giancoli": [
                (97, 136),  # Ch 5 Examples & Problems
                (153, 153), # Ch 5 MCQ page
                (170, 193), # Ch 7 Examples & Problems
                (212, 212), # Ch 7 MCQ page
                (200, 223), # Ch 8 Examples & Problems
                (242, 242), # Ch 8 MCQ page
                (292, 310), # Ch 11 Examples
                (322, 327), # Ch 11 Problems
                (342, 342)  # Ch 11 MCQ page
            ],
            "hrk": [
                (224, 226), # Ch 7 Review page 225
                (232, 234), # Ch 7 Problems page 233
                (270, 272), # Ch 8 Review page 271
                (310, 312), # Ch 9 Review page 311
                (351, 353), # Ch 10 Problems page 352
                (465, 467)  # Ch 15 Problems page 466
            ]
        },
        4: {
            "giancoli": [
                (443, 472), # Ch 16 Examples
                (489, 489), # Ch 16 MCQ page
                (473, 498), # Ch 17 Examples & Problems
                (516, 516), # Ch 17 MCQ page
                (499, 558), # Ch 18-19 Examples & Problems
                (542, 542), # Ch 18 MCQ page
                (572, 572), # Ch 19 MCQ page
                (559, 589), # Ch 20 Examples & Problems
                (604, 604)  # Ch 20 MCQ page
            ],
            "hrk": [
                (648, 650), # Ch 21 Review page 649
                (652, 654), # Ch 21 Problems page 653
                (676, 678), # Ch 22 Review page 677
                (682, 684), # Ch 22 Problems page 683
                (734, 736), # Ch 24 Review page 735
                (740, 742), # Ch 24 Problems page 741
                (763, 765)  # Ch 25 Problems page 764
            ]
        },
        5: {
            "giancoli": [
                (292, 310), # Ch 11 Examples
                (322, 327), # Ch 11 Problems
                (342, 342), # Ch 11 MCQ page
                (328, 353), # Ch 12 Examples & Problems
                (374, 374), # Ch 12 MCQ page
                (649, 680), # Ch 23 Examples & Problems
                (693, 693), # Ch 23 MCQ page
                (744, 770), # Ch 26 Examples
                (787, 787), # Ch 26 MCQ page
                (771, 802), # Ch 27 Examples & Problems
                (819, 819), # Ch 27 MCQ page
                (865, 884), # Ch 30 Examples
                (911, 914), # Ch 30 Problems
                (901, 901)  # Ch 30 MCQ page
            ],
            "hrk": [
                (497, 499), # Ch 16 page 498
                (880, 882), # Ch 27 page 881
                (926, 928), # Ch 28 page 927
                (1024, 1026)# Ch 30 page 1025
            ]
        },
        # Day 6 and Day 7 do not have direct textbook assignments but rather full mock review
        # We can extract the textbook formula review pages or endpaper charts for them
        6: {
            "giancoli": [
                (1, 10),    # Introductory formula/conversion pages
            ],
            "hrk": []
        },
        7: {
            "giancoli": [
                (1, 10),    # Introductory formula/conversion pages
            ],
            "hrk": []
        }
    }
    
    print("\nStarting extraction...")
    for day, specs in battle_plan_specs.items():
        print(f"\n--- Extracting Day {day} ---")
        output_name = f"Day_{day}.pdf"
        success = extract_ranges_to_pdf(g_reader, g_offset, h_reader, h_offset, specs, output_name)
        if not success:
            print(f"  Failed or skipped Day {day}")
            
    print("\n" + "=" * 60)
    print("ALL DONE! PDFs have been saved to frontend/public/pdfs/")
    print("=" * 60)

if __name__ == "__main__":
    main()
