import { getData } from './storage-utils.js';

//  calculate financial reports function
function generateFinancialReport(startDate, endDate) {
    const purchases = getData('purchases') || [];
    const sales = getData('sales') || [];
    const inventory = getData('inventory') || [];

    let totalExpenses = 0;
    let totalIncome = 0;

    // filtering purchases and sales by the selected period
    const filteredPurchases = purchases.filter(purchase => 
        new Date(purchase.purchaseDate) >= new Date(startDate) && new Date(purchase.purchaseDate) <= new Date(endDate)
    );

    const filteredSales = sales.filter(sale => 
        new Date(sale.date) >= new Date(startDate) && new Date(sale.date) <= new Date(endDate)
    );

    // calculate total expenses using purchases
    filteredPurchases.forEach((purchase) => {
        totalExpenses += purchase.totalCost;
    });

    // calculate total income using sales
    filteredSales.forEach((sale) => {
        totalIncome += sale.totalPrice;
    });

    // calculate tax (e.g., 10% of total income)
    const taxRate = 0.1;
    const totalTax = totalIncome * taxRate;

    // calculate net profit
    const netProfit = totalIncome - totalExpenses - totalTax;

    // calculate number of products sold for each category
    const productsSoldPerCategory = filteredSales.reduce((acc, sale) => {
        if (!acc[sale.category]) {
            acc[sale.category] = 0;
        }
        acc[sale.category] += sale.quantity;
        return acc;
    }, {});

    // generating report content
    const reportContent = `
        <h3>Financial Report (${startDate} to ${endDate})</h3>
        <p>Total Income: $${totalIncome.toFixed(2)}</p>
        <p>Total Expenses: $${totalExpenses.toFixed(2)}</p>
        <p>Total Tax: $${totalTax.toFixed(2)}</p>
        <p>Net Profit: $${netProfit.toFixed(2)}</p>
        <h4>Products Sold Per Category</h4>
        <ul>
            ${Object.entries(productsSoldPerCategory).map(([category, quantity]) => `<li>${category}: ${quantity} units</li>`).join('')}
        </ul>
        <h4>Current Stock</h4>
        <ul>
            ${inventory.map(item => `<li>${item.category}: ${item.quantityAvailable.toFixed(2)} kg</li>`).join('')}
        </ul>
    `;

    // display the report
    const reportContainer = document.getElementById('reports-container');
    reportContainer.innerHTML = reportContent;

    //  downloading option
    const downloadCSVButton = document.createElement('button');
    downloadCSVButton.textContent = 'Download CSV';
    downloadCSVButton.addEventListener('click', () => downloadReportAsCSV(filteredPurchases, filteredSales, totalIncome, totalExpenses, totalTax, netProfit, productsSoldPerCategory, inventory));

    reportContainer.appendChild(downloadCSVButton);
}

//  downloading report as CSV
function downloadReportAsCSV(purchases, sales, totalIncome, totalExpenses, totalTax, netProfit, productsSoldPerCategory, inventory) {
    const headers = ['Category', 'Quantity Sold', 'Current Stock'];
    const rows = Object.entries(productsSoldPerCategory).map(([category, quantity]) => {
        const stock = inventory.find(item => item.category === category)?.quantityAvailable || 0;
        return [category, quantity, stock.toFixed(2)];
    });

    const csvContent = [
        ['Total Income', totalIncome.toFixed(2)],
        ['Total Expenses', totalExpenses.toFixed(2)],
        ['Total Tax', totalTax.toFixed(2)],
        ['Net Profit', netProfit.toFixed(2)],
        headers,
        ...rows
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'financial_report.csv';
    link.click();
}

//  loading the reports section
function loadReportsSection() {
    const reportsContainer = document.getElementById('reports-container');

    reportsContainer.innerHTML = `
        <h3>Financial Reports</h3>
        <p>Select the reporting period to generate the report.</p>
        <form id="report-form">
            <label for="report-type">Report Type:</label>
            <select id="report-type" required>
                <option value="custom">Custom</option>
                <option value="monthly">Monthly</option>
            </select>
            <div id="custom-date-range">
                <label for="start-date">Start Date:</label>
                <input type="date" id="start-date" name="start-date" required>
                <label for="end-date">End Date:</label>
                <input type="date" id="end-date" name="end-date" required>
            </div>
            <div id="monthly-date-range" style="display: none;">
                <label for="month">Month:</label>
                <input type="month" id="month" name="month">
            </div>
            <button type="submit">Generate Report</button>
        </form>
    `;

    const reportForm = document.getElementById('report-form');
    const reportTypeSelect = document.getElementById('report-type');
    const customDateRange = document.getElementById('custom-date-range');
    const monthlyDateRange = document.getElementById('monthly-date-range');

    reportTypeSelect.addEventListener('change', () => {
        if (reportTypeSelect.value === 'monthly') {
            customDateRange.style.display = 'none';
            monthlyDateRange.style.display = 'block';
            document.getElementById('start-date').removeAttribute('required');
            document.getElementById('end-date').removeAttribute('required');
        } else {
            customDateRange.style.display = 'block';
            monthlyDateRange.style.display = 'none';
            document.getElementById('start-date').setAttribute('required', 'required');
            document.getElementById('end-date').setAttribute('required', 'required');
        }
    });

    reportForm.addEventListener('submit', (event) => {
        event.preventDefault();
        let startDate, endDate;

        if (reportTypeSelect.value === 'monthly') {
            const month = document.getElementById('month').value;
            if (!month) {
                alert('Please select a month.');
                return;
            }
            startDate = new Date(month);
            endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        } else {
            startDate = document.getElementById('start-date').value;
            endDate = document.getElementById('end-date').value;
        }

        generateFinancialReport(startDate, endDate);
    });
}

export { loadReportsSection, generateFinancialReport };
