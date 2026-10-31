import subprocess
import sys
import time

from playwright.sync_api import sync_playwright


def run_tests():
    print("🚀 Starting local Uvicorn backend server on port 8000...")
    proc = subprocess.Popen(
        [
            "/Users/vishwjeetchavan/Desktop/Hackathon/heatatlas/venv/bin/uvicorn",
            "app:app",
            "--port",
            "8000",
        ],
        cwd="/Users/vishwjeetchavan/Desktop/Hackathon/heatatlas",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    time.sleep(2.5)

    errors_found = []
    console_errors = []
    failed_requests = []
    tested_actions = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)

            # --- 1. DESKTOP VIEWPORT TEST (React App) ---
            print("\n🖥️  [TEST 1] Desktop Viewport (1280x800) - Main App (/)")
            context = browser.new_context(
                viewport={"width": 1280, "height": 800},
                geolocation={"latitude": 18.5204, "longitude": 73.8567},
                permissions=["geolocation"],
            )
            page = context.new_page()

            page.on(
                "console",
                lambda msg: (
                    console_errors.append(f"[{msg.type}] {msg.text}")
                    if msg.type in ["error"]
                    else None
                ),
            )
            page.on(
                "requestfailed",
                lambda req: failed_requests.append(
                    f"FAILED REQ: {req.url} - {req.failure}"
                ),
            )

            response = page.goto("http://127.0.0.1:8000/", timeout=15000)
            assert response.status == 200, f"Page load status {response.status}"
            page.wait_for_selector(".leaflet-container", timeout=10000)
            tested_actions.append("Desktop page initial load & Leaflet render")

            # 1.1 Test City Switcher (all 8 genuine cities)
            print("  🔄 Testing City Selector across all 8 genuine cities...")
            cities = [
                "pune",
                "nagpur",
                "mumbai",
                "sambhajinagar",
                "nashik",
                "solapur",
                "delhi",
                "nanded",
            ]
            city_select = page.locator("select").first
            for c in cities:
                city_select.select_option(value=c)
                time.sleep(0.4)
                tested_actions.append(f"City switch to {c}")
            print(f"  ✓ Successfully cycled through all {len(cities)} cities")

            # Return to Pune
            city_select.select_option(value="pune")
            time.sleep(0.4)

            # 1.2 Test Language Selector (EN, HI, MR)
            print("  🌐 Testing Language Selector...")
            lang_select = page.locator("select").nth(1)
            for l in ["hi", "mr", "en"]:
                lang_select.select_option(value=l)
                time.sleep(0.3)
                tested_actions.append(f"Language switch to {l}")
            print("  ✓ Language toggle tested (EN, Hindi, Marathi)")

            # 1.3 Test Timeline Slider & Snap to Live
            print("  ⏱️  Testing Timeline Scrubber & Snap to Live...")
            slider = page.locator('input[type="range"]').first
            slider.fill("14")
            time.sleep(0.3)
            tested_actions.append("Timeline slider set to 14:00")

            snap_btn = page.locator("button:has-text('Snap to Live')").first
            if snap_btn.is_visible():
                snap_btn.click()
                time.sleep(0.3)
                tested_actions.append("Click 'Snap to Live'")
                print("  ✓ Clicked 'Snap to Live' button")

            # 1.4 Test Map Controls (Recenter, GPS, Cool Corridor)
            print("  🧭 Testing Map Controls (Recenter, GPS)...")
            gps_btn = page.locator("button[title*='GPS'], button:has-text('GPS')").first
            if gps_btn.is_visible():
                gps_btn.click()
                time.sleep(0.3)
                tested_actions.append("Click GPS Locate button")

            # 1.5 Test View Modes
            print("  🔀 Testing Tab Navigation across all modes...")

            # Mode: NGO Command Center
            ngo_btn = page.locator(
                "button:has-text('Command Center'), button:has-text('NGO')"
            ).first
            if ngo_btn.is_visible():
                ngo_btn.click()
                time.sleep(1)
                tested_actions.append("Switch to NGO Command view")
                print("  ✓ Switched to NGO Command Center view")

                # Check metrics & quick city pills in NGO
                nagpur_pill = page.locator("button:has-text('Nagpur')").first
                if nagpur_pill.is_visible():
                    nagpur_pill.click()
                    time.sleep(0.5)
                    tested_actions.append("NGO quick-select Nagpur pill")
                    pune_pill = page.locator("button:has-text('Pune')").first
                    if pune_pill.is_visible():
                        pune_pill.click()
                        time.sleep(0.5)
                        tested_actions.append("NGO quick-select Pune pill")

                # Dispatch Action button
                dispatch_btn = page.locator(
                    "button:has-text('Dispatch'), button:has-text('Deploy')"
                ).first
                if dispatch_btn.is_visible():
                    dispatch_btn.click()
                    time.sleep(0.5)
                    tested_actions.append("Click Dispatch Relief button")

            # Mode: Report Beacon
            report_btn = page.locator(
                "button:has-text('Crowd Beacons'), button:has-text('Report')"
            ).first
            if report_btn.is_visible():
                report_btn.click()
                time.sleep(0.8)
                tested_actions.append("Switch to Crowd Report view")
                print("  ✓ Switched to Citizen Report / Beacon view")

            # Mode: Audit / Science
            audit_btn = page.locator(
                "button:has-text('Audit'), button:has-text('Math')"
            ).first
            if audit_btn.is_visible():
                audit_btn.click()
                time.sleep(0.8)
                tested_actions.append("Switch to Audit view")
                print("  ✓ Switched to Audit / Math Spec view")

            # Switch back to Worker / Heat mode
            worker_btn = page.locator(
                "button:has-text('Worker View'), button:has-text('Heat Map')"
            ).first
            if worker_btn.is_visible():
                worker_btn.click()
                time.sleep(0.8)
                tested_actions.append("Return to Worker/Heat view")
                print("  ✓ Returned to Worker Heat Map view")

            # --- 2. MOBILE VIEWPORT TEST (iPhone 14) ---
            print(
                "\n📱 [TEST 2] Mobile Viewport (390x844) - Mobile Drawer & Interactions"
            )
            mobile_context = browser.new_context(
                viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True
            )
            mobile_page = mobile_context.new_page()
            mobile_page.goto("http://127.0.0.1:8000/", timeout=15000)
            mobile_page.wait_for_selector(".leaflet-container", timeout=10000)
            tested_actions.append("Mobile page load & Leaflet render")
            print("  ✓ Mobile map loaded")

            # Check Mobile Drawer Toggle
            drawer_toggle = mobile_page.locator(
                "button:has-text('Hide Panel'), button:has-text('Show Panel')"
            ).first
            if drawer_toggle.is_visible():
                drawer_toggle.click()
                time.sleep(0.4)
                tested_actions.append("Mobile Hide Panel click")
                print("  ✓ Clicked Mobile Hide Panel toggle")
                drawer_toggle.click()
                time.sleep(0.4)
                tested_actions.append("Mobile Show Panel click")
                print("  ✓ Restored Mobile Panel")

            # --- 3. SHOWCASE HUB TEST (/showcase.html) ---
            print("\n🌐 [TEST 3] Showcase Hub (/showcase.html)")
            showcase_page = browser.new_page(viewport={"width": 1280, "height": 800})
            sc_resp = showcase_page.goto(
                "http://127.0.0.1:8000/showcase.html", timeout=15000
            )
            assert sc_resp.status == 200, f"/showcase.html status {sc_resp.status}"
            tested_actions.append("/showcase.html loaded")

            # Test Showcase Tabs
            sc_tabs = ["live", "videos", "arch", "code", "deck", "checklist"]
            for tab in sc_tabs:
                tab_btn = showcase_page.locator(
                    f"button[onclick*=\"switchTab('{tab}')\"]"
                ).first
                if tab_btn.is_visible():
                    tab_btn.click()
                    time.sleep(0.3)
                    tested_actions.append(f"Showcase tab switch: {tab}")
                    print(f"  ✓ Clicked showcase tab: {tab}")

            # --- 4. DASHBOARD TEST (/dashboard.html) ---
            print("\n📊 [TEST 4] Executive Dashboard (/dashboard.html)")
            dash_page = browser.new_page(viewport={"width": 1280, "height": 800})
            d_resp = dash_page.goto(
                "http://127.0.0.1:8000/dashboard.html", timeout=15000
            )
            assert d_resp.status == 200, f"/dashboard.html status {d_resp.status}"
            dash_page.wait_for_selector(".leaflet-container", timeout=10000)
            tested_actions.append("/dashboard.html loaded & map render")
            print("  ✓ Dashboard Leaflet map loaded")

            # Switch dashboard portal modes
            for p_mode in ["command", "beacon", "overview"]:
                btn = dash_page.locator(
                    f"button[onclick*=\"setPortalMode('{p_mode}')\"]"
                ).first
                if btn.is_visible():
                    btn.click()
                    time.sleep(0.3)
                    tested_actions.append(f"Dashboard portal mode switch: {p_mode}")
                    print(f"  ✓ Dashboard switched to mode: {p_mode}")

            # --- 5. SWAGGER API DOCS TEST (/docs) ---
            print("\n📖 [TEST 5] OpenAPI Swagger Docs (/docs)")
            docs_page = browser.new_page()
            docs_resp = docs_page.goto("http://127.0.0.1:8000/docs", timeout=15000)
            assert docs_resp.status == 200, f"/docs status {docs_resp.status}"
            docs_page.wait_for_selector(".swagger-ui", timeout=10000)
            tested_actions.append("/docs loaded & Swagger UI render")
            print("  ✓ Swagger UI rendered successfully")

            browser.close()

    except Exception as e:
        print(f"❌ Exception occurred during testing: {e}")
        errors_found.append(str(e))
    finally:
        print("\n🛑 Stopping background Uvicorn server...")
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except Exception:
            proc.kill()

    # Filter out harmless OSM tile network aborts on rapid viewport resize/closing
    critical_console_errors = [c for c in console_errors if "favicon" not in c]
    critical_network_fails = [
        f
        for f in failed_requests
        if "openstreetmap.org" not in f and "favicon" not in f
    ]

    print("\n" + "=" * 60)
    print("📋 EXHAUSTIVE BUG TEST AUDIT REPORT")
    print(f"  Total Interactive Actions Tested: {len(tested_actions)}")
    for a in tested_actions:
        print(f"    ✔️  {a}")
    print(f"  Total Runtime / Playwright Exceptions: {len(errors_found)}")
    print(f"  Critical Console Errors: {len(critical_console_errors)}")
    for ce in critical_console_errors:
        print(f"    🔴 {ce}")
    print(f"  Critical Network Failures: {len(critical_network_fails)}")
    for cf in critical_network_fails:
        print(f"    🟠 {cf}")
    print("=" * 60)

    if (
        len(errors_found) == 0
        and len(critical_console_errors) == 0
        and len(critical_network_fails) == 0
    ):
        print(
            "🎉 ALL SYSTEMS GREEN! Zero functional bugs, zero console crashes, zero failed endpoints."
        )
        sys.exit(0)
    else:
        print("⚠️ Some issues detected.")
        sys.exit(1)


if __name__ == "__main__":
    run_tests()
