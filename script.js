// --- GLOBAL FUNCTIONS & UI LOGIC ---

// Modal Logic
function openModal(context) {
    const modal = document.getElementById('leadModal');
    if(modal) {
        modal.classList.add('active');
        const title = document.getElementById('modalTitle');
        if(title) title.innerText = context || "Request Demo";
    }
}

function closeModal() {
    const modal = document.getElementById('leadModal');
    if(modal) modal.classList.remove('active');
}

// FAQ Logic
function toggleFAQ(element) {
    const wasActive = element.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    if (!wasActive) element.classList.add('active');
}

function toggleMoreFAQs() {
    const moreFaqs = document.getElementById('faq-more');
    const btn = document.getElementById('faq-toggle-btn');
    if (moreFaqs.style.display === 'none') {
        moreFaqs.style.display = 'block';
        btn.textContent = 'Show Fewer Questions';
    } else {
        moreFaqs.style.display = 'none';
        btn.textContent = 'Show More Questions';
    }
}

// Navigation & Scroll
function scrollToSection(id) {
    const element = document.getElementById(id);
    if(element) element.scrollIntoView({ behavior: 'smooth' });
}

// ROI: Assumptions Toggle
function toggleAssumptions() {
    const hiddenSection = document.getElementById('roi-assumptions');
    if (hiddenSection) {
        hiddenSection.classList.toggle('active');
    }
}


/* ========== ROI CALCULATOR LOGIC (SEGMENT SPECIFIC) ========== */

// 1. Define Data & Defaults per Segment
const segmentData = {
    rental: {
        staffLabel: "Counter Time Saved (Mins/Rental)",
        staffHint: "Time saved on physical handover, paperwork & key exchange.",
        staffDefault: 20, 
        bonusLabel: "Utilization Increase (%)",
        bonusHint: "Additional rental days gained via 24/7 self-service access.",
        bonusDefault: 6, // Conservative Estimate
        resStaff: "⚡ Counter Automation",
        resBonus: "📈 Utilization Boost"
    },
    gig: {
        staffLabel: "Admin Hours Saved (Hrs/Car/Mo)",
        staffHint: "Time saved on recurring billing, contract renewals & onboarding.",
        staffDefault: 1.5,
        bonusLabel: "Payment Default Rate (%)",
        bonusHint: "Percentage of drivers who miss payments or default.",
        bonusDefault: 7, // Higher Risk for Gig
        resStaff: "⚡ Admin Automation",
        resBonus: "💰 Bad Debt Recovered"
    },
    corporate: {
        staffLabel: "Mgmt Time Saved (Mins/Car/Mo)",
        staffHint: "Time saved per vehicle on key logs, scheduling & dispatch.",
        staffDefault: 30,
        bonusLabel: "Fleet Reduction Potential (%)",
        bonusHint: "Percentage of vehicles you can sell due to better sharing.",
        bonusDefault: 5,
        resStaff: "⚡ Mgmt Efficiency",
        resBonus: "📉 CapEx Savings"
    }
};

// 2. Helper: Get Value (Returns 0 if empty/deleted, returns default if missing element)
function getValue(id, fallbackIfMissing) {
    const el = document.getElementById(id);
    if (!el) return fallbackIfMissing;
    
    // If the field is empty (user deleted text), return 0
    if (el.value === "") return 0;
    
    // Otherwise return the number
    const val = parseFloat(el.value);
    return isNaN(val) ? 0 : val;
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

function formatMoney(x) {
    return '$' + Math.round(x).toLocaleString();
}

// 3. Toggle Logic (Swaps Labels & Inputs)
function toggleSegmentFields() {
    const typeEl = document.getElementById('business-type');
    const type = typeEl ? typeEl.value : 'gig'; 
    const data = segmentData[type];

    if(!data) return;

    // Update Text Labels
    setText('staff-label', data.staffLabel);
    setText('staff-hint', data.staffHint);
    setText('bonus-label', data.bonusLabel);
    setText('bonus-hint', data.bonusHint);
    
    // Update Result Labels
    setText('res-label-staff', data.resStaff);
    setText('res-label-bonus', data.resBonus);

    // Update Default Values
    setValue('staff-metric', data.staffDefault);
    setValue('bonus-metric', data.bonusDefault);

    // Hide 'Monthly Revenue' for Corporate (Not relevant)
    const revInput = document.getElementById('monthly-revenue');
    if(revInput) {
        const container = revInput.closest('.input-group');
        if(container) {
             container.style.display = (type === 'corporate') ? 'none' : 'block';
        }
    }

    calculateROI();
}

// 4. Main Calculation Function
function calculateROI() {
    const typeEl = document.getElementById('business-type');
    const type = typeEl ? typeEl.value : 'gig'; 

    // Inputs (Defaults provided if element is missing from HTML)
    // IMPORTANT: Because HTML has value="50", getValue returns 50 initially.
    // If user deletes it, getValue returns 0.
    const fleet = getValue('fleet-size', 50); 
    const vehicleValue = getValue('vehicle-value', 25000);
    
    // Hidden Inputs
    const staffRate = getValue('staff-rate', 20); 
    const monthlyRev = getValue('monthly-revenue', 1200); 
    const theftRate = getValue('theft-rate', 1); 
    
    // Dynamic Inputs
    const staffMetric = getValue('staff-metric', 0);
    const bonusMetric = getValue('bonus-metric', 0);

    let assetSavings = 0;
    let staffSavings = 0;
    let bonusSavings = 0;

    // --- MATH LOGIC ---

    // A. Asset Protection (Standard)
    const theftRisk = fleet * (theftRate / 100);
    const recoveryDelta = 0.40; 
    assetSavings = theftRisk * vehicleValue * recoveryDelta;

    // B. Segment Specific
    if (type === 'rental') {
        // Staff: Mins/Rental -> Annualized (Assumes 4 rentals/mo)
        const rentalsPerMonth = fleet * 4; 
        const hoursSaved = (rentalsPerMonth * staffMetric) / 60;
        staffSavings = hoursSaved * staffRate * 12;
        
        // Bonus: Utilization Increase
        bonusSavings = fleet * monthlyRev * (bonusMetric / 100) * 12;
    } 
    else if (type === 'gig') {
        // Staff: Admin Hours/Car -> Annualized
        staffSavings = fleet * staffMetric * staffRate * 12;
        
        // Bonus: Bad Debt Recovery (High Uplift: 85%)
        const collectionUplift = 0.85; 
        const potentialBadDebt = fleet * (bonusMetric / 100) * monthlyRev;
        bonusSavings = potentialBadDebt * collectionUplift * 12;
    } 
    else if (type === 'corporate') {
        // Staff: Mins/Car -> Annualized
        const totalHoursSaved = (staffMetric * fleet) / 60;
        staffSavings = totalHoursSaved * staffRate * 12;
        
        // Bonus: Fleet Reduction (Total Asset Value Released)
        const carsSold = fleet * (bonusMetric / 100);
        bonusSavings = carsSold * vehicleValue;
    }

    const total = assetSavings + staffSavings + bonusSavings;

    // C. Render Results
    setText('res-asset', formatMoney(assetSavings));
    setText('res-staff', formatMoney(staffSavings));
    setText('res-bonus', formatMoney(bonusSavings));
    setText('res-total', formatMoney(total));
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Mobile Navigation Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
            if(navMenu.style.display === 'flex') {
                navMenu.style.flexDirection = 'column';
                navMenu.style.position = 'absolute';
                navMenu.style.top = '70px';
                navMenu.style.left = '0';
                navMenu.style.width = '100%';
                navMenu.style.backgroundColor = '#0c1c33';
                navMenu.style.padding = '2rem';
            }
        });
    }

    // 2. Modal Close on Outside Click
    window.onclick = function(event) {
        const modal = document.getElementById('leadModal');
        if (event.target === modal) closeModal();
    }

    // 3. Initialize ROI Calculator
    toggleSegmentFields(); // Sets initial labels & calculates
    
    const roiContainer = document.querySelector('.roi-wrapper');
    if (roiContainer) {
        roiContainer.addEventListener('input', calculateROI);
    }
});