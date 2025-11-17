function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// FAQ Toggle
function toggleFAQ(element) {
    const answer = element.querySelector('.faq-answer');
    const icon = element.querySelector('.faq-icon');
    
    // Close all other FAQs
    document.querySelectorAll('.faq-answer').forEach(item => {
        if (item !== answer) {
            item.classList.remove('active');
            item.parentElement.querySelector('.faq-icon').style.transform = 'rotate(0deg)';
        }
    });
    
    // Toggle current FAQ
    answer.classList.toggle('active');
    icon.style.transform = answer.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
}

// Toggle More FAQs
function toggleMoreFAQs() {
    const moreFaqs = document.getElementById('more-faqs');
    const btn = document.getElementById('faq-toggle-btn');
    
    if (moreFaqs.style.display === 'none') {
        moreFaqs.style.display = 'block';
        btn.textContent = 'Show Fewer Questions';
    } else {
        moreFaqs.style.display = 'none';
        btn.textContent = 'Show More Questions';
    }
}

// ROI Calculator
const fleetInput = document.getElementById('fleet-size');
const vehicleValueInput = document.getElementById('vehicle-value');
const rentalInput = document.getElementById('rental-rate');
const theftRateInput = document.getElementById('theft-rate');
const staffHoursInput = document.getElementById('staff-hours');
const staffRateInput = document.getElementById('staff-rate');
const disputesInput = document.getElementById('disputes');

function updateROI() {
    const fleet = parseInt(fleetInput.value) || 50;
    const vehicleValue = parseInt(vehicleValueInput.value) || 25000;
    const dailyRate = parseInt(rentalInput.value) || 45;
    const theftRate = parseFloat(theftRateInput.value) || 1;
    const staffHours = parseFloat(staffHoursInput.value) || 2;
    const staffRate = parseInt(staffRateInput.value) || 15;
    const disputes = parseInt(disputesInput.value) || 5;
    
    // 1. THEFT PREVENTION
    const expectedThefts = fleet * (theftRate / 100);
    const preventedThefts = expectedThefts * 0.80;
    const theftSavings = preventedThefts * vehicleValue;
    
    // 2. STAFF TIME SAVINGS
    const staffSavings = staffHours * 365 * staffRate;
    
    // 3. UTILIZATION INCREASE
    const utilizationBenefit = fleet * dailyRate * 365 * 0.10;
    
    // 4. DISPUTE REDUCTION
    const disputeSavings = disputes * 0.80 * 500;
    
    // TOTAL BENEFITS
    const totalBenefit = theftSavings + staffSavings + utilizationBenefit + disputeSavings;
    
    // COSTS (IturanMob Full)
    const setupCost = fleet * 149.99;
    const subscriptionCost = fleet * 24.99 * 12;
    const totalCost = setupCost + subscriptionCost;
    
    // NET BENEFIT & ROI
    const netBenefit = totalBenefit - totalCost;
    const roi = (netBenefit / totalCost * 100).toFixed(0);
    
    // UPDATE DISPLAY
    document.getElementById('theft-savings').textContent = '+$' + Math.round(theftSavings).toLocaleString();
    document.getElementById('staff-savings').textContent = '+$' + Math.round(staffSavings).toLocaleString();
    document.getElementById('utilization-benefit').textContent = '+$' + Math.round(utilizationBenefit).toLocaleString();
    document.getElementById('dispute-savings').textContent = '+$' + Math.round(disputeSavings).toLocaleString();
    document.getElementById('total-benefit').textContent = '$' + Math.round(totalBenefit).toLocaleString();
    document.getElementById('setup-cost').textContent = '$' + Math.round(setupCost).toLocaleString();
    document.getElementById('subscription-cost').textContent = '$' + Math.round(subscriptionCost).toLocaleString() + '/year';
    document.getElementById('annual-cost').textContent = '$' + Math.round(totalCost).toLocaleString();
    document.getElementById('net-benefit').textContent = '$' + Math.round(netBenefit).toLocaleString();
    document.getElementById('roi-percent').textContent = roi + '%';
}

// Add event listeners to all inputs
fleetInput.addEventListener('input', updateROI);
vehicleValueInput.addEventListener('input', updateROI);
rentalInput.addEventListener('input', updateROI);
theftRateInput.addEventListener('input', updateROI);
staffHoursInput.addEventListener('input', updateROI);
staffRateInput.addEventListener('input', updateROI);
disputesInput.addEventListener('input', updateROI);

// Form submission
function handleFormSubmit(event) {
    event.preventDefault();
    alert('Thank you for your interest! We will contact you shortly to schedule your demo.');
    event.target.reset();
}

// Open first FAQ by default
document.addEventListener('DOMContentLoaded', function() {
    const firstFAQ = document.querySelectorAll('.faq-question')[0];
    if (firstFAQ) {
        toggleFAQ(firstFAQ.parentElement);
    }
    updateROI();
});
    </script>
