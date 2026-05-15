// --- TAB LOGIC ---
// This needs to be outside the DOMContentLoaded so the HTML can "see" it
function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    // We use event.currentTarget to highlight the button clicked
    event.currentTarget.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. SELECT ALL ELEMENTS (Calculator)
    const calculatorForm = document.getElementById('ArbitrageCalculatorForm');
    const stake_input = document.getElementById('stake');
    const odds1_input = document.getElementById('odds1');
    const odds2_input = document.getElementById('odds2');
    const stakes_output = document.getElementById('stakes');
    const result_total = document.getElementById('result');
    const arbitrage = document.getElementById('arbitrage');
    const arb_percent = document.getElementById('arb-percent');
    const profit_percent = document.getElementById('profit_percent');
    const error = document.getElementById('error');
    const myButton = document.getElementById('button');

    // 2. SELECT ALL ELEMENTS (Converter)
    const convInput = document.getElementById('conv-input');
    const decOut = document.getElementById('dec-out');
    const mathExpl = document.getElementById('math-explanation');

    // --- ODDS CONVERTER LOGIC ---
    const toggleBtn = document.getElementById('toggle-conv');
    const convModeText = document.getElementById('conv-mode-text');
    const convLabel = document.getElementById('conv-label');
    let isAmericanToDecimal = true;

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            isAmericanToDecimal = !isAmericanToDecimal;
            // Reset UI on toggle
            convInput.value = '';
            decOut.textContent = '-';
            mathExpl.innerHTML = '';
            
            if (isAmericanToDecimal) {
                convModeText.textContent = "American to Decimal";
                convLabel.textContent = "Enter American Odds (-110 or +150):";
                convInput.placeholder = "e.g. -110";
            } else {
                convModeText.textContent = "Decimal to American";
                convLabel.textContent = "Enter Decimal Odds (e.g. 1.91 or 2.50):";
                convInput.placeholder = "e.g. 2.00";
            }
        });
    }

    if (convInput) {
        convInput.addEventListener('input', () => {
            const val = parseFloat(convInput.value);
            if (isNaN(val)) {
                decOut.textContent = "-";
                mathExpl.innerHTML = "";
                return;
            }

            let result;
            let formula;

            if (isAmericanToDecimal) {
                // AMERICAN -> DECIMAL
                if (val > -100 && val < 100) {
                    mathExpl.innerHTML = "American odds must be >= 100 or <= -100";
                    return;
                }
                if (val >= 100) {
                    result = (val / 100) + 1;
                    formula = `Math: (${val} / 100) + 1 = ${result.toFixed(3)}`;
                } else {
                    result = (100 / Math.abs(val)) + 1;
                    formula = `Math: (100 / ${Math.abs(val)}) + 1 = ${result.toFixed(3)}`;
                }
                decOut.textContent = result.toFixed(3);
            } else {
                // DECIMAL -> AMERICAN
                if (val <= 1) {
                    mathExpl.innerHTML = "Decimal odds must be greater than 1.00";
                    return;
                }
                if (val >= 2.00) {
                    result = (val - 1) * 100;
                    formula = `Math: (${val} - 1) * 100 = +${Math.round(result)}`;
                    decOut.textContent = "+" + Math.round(result);
                } else {
                    result = -100 / (val - 1);
                    formula = `Math: -100 / (${val} - 1) = ${Math.round(result)}`;
                    decOut.textContent = Math.round(result);
                }
            }
            mathExpl.innerHTML = `<strong>Formula used:</strong><br>${formula}`;
        });
    }

    // --- CALCULATOR LOGIC ---
    if (myButton) {
        myButton.addEventListener('click', () => {
            const stake = parseFloat(stake_input.value);
            const american_odds1 = parseFloat(odds1_input.value);
            const american_odds2 = parseFloat(odds2_input.value);
            
            // Validation first
            if (!stake_input.value || !odds1_input.value || !odds2_input.value) {
                error.textContent = "Must input valid values for total stake and both odds values !!!";
                return; 
            }

            let decimal_odds1;
            let decimal_odds2;

            // Conversion Math
            if (american_odds1 >= 100) {
                decimal_odds1 = (american_odds1 / 100) + 1;
            } else if (american_odds1 <= -100) {
                decimal_odds1 = (100 / Math.abs(american_odds1)) + 1;
            } 

            if (american_odds2 >= 100) {
                decimal_odds2 = (american_odds2 / 100) + 1;
            } else if (american_odds2 <= -100) {
                decimal_odds2 = (100 / Math.abs(american_odds2)) + 1;
            } 

            const total_odds = (1/decimal_odds1) + (1/decimal_odds2);
            const arb_percentage = (1 - total_odds) * 100;
            const arb_percentage_rounded = arb_percentage.toFixed(2);

            // Scenarios
            if (!stake_input.value || !odds1_input.value || !odds2_input.value) {
                result_total.classList.remove('border');
                arbitrage.textContent = '';
                arb_percent.textContent = '';
				profit_percent.textContent = '';
                stakes_output.textContent = '';
                result_total.textContent = '';
                error.textContent = "Must input valid values for total stake and both odds values !!!";
            } else if (american_odds1 >= -99 && american_odds1 <= 99 || american_odds2 >= -99 && american_odds2 <= 99) {
                result_total.classList.remove('border');
                arbitrage.textContent = '';
                arb_percent.textContent = '';
				profit_percent.textContent = '';
                stakes_output.textContent = '';
                result_total.textContent = '';
                error.textContent = "Incorrect Odds Input !!!";
            } else if (total_odds >= 1) {
                result_total.classList.remove('border');
                arbitrage.textContent = "Arbitrage opportunity does NOT exist";
                arb_percent.textContent = `Arb %: ${arb_percentage_rounded}%`;
                profit_percent.textContent = '';
                stakes_output.textContent = '';
                result_total.textContent = '';
                error.textContent = '';
            } else {
                // Calculate Stakes and Profit
                const stake1 = (stake / decimal_odds1) / total_odds;
                const stake2 = (stake / decimal_odds2) / total_odds;
                const profit1 = (stake1 * decimal_odds1) - stake;
                const percent_profit = (profit1/stake) * 100;

                arbitrage.textContent = "Arbitrage opportunity EXISTS !!!";
                arb_percent.textContent = `Arb %: ${arb_percentage_rounded}%`;
                profit_percent.textContent = `% Profit: ${percent_profit.toFixed(2)}%`;
                stakes_output.textContent = `Stake 1: $${stake1.toFixed(2)}  |  Stake 2: $${stake2.toFixed(2)}`;
                result_total.textContent = `Total Profit: $${profit1.toFixed(2)}`;
                result_total.classList.add('border');
                error.textContent = '';
            }
        });

        // Reset functionality
        calculatorForm.addEventListener('reset', () => {
            result_total.classList.remove('border');
            stakes_output.textContent = '';
            result_total.textContent = '';
            arbitrage.textContent = '';
            arb_percent.textContent = '';
            profit_percent.textContent = '';
            error.textContent = '';
        });
    }
});