

// utility  to get data from localstorage
function getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

// utility  to save data to localstorage
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// utility  to reset data in localstorage
function resetData(key) {
    localStorage.removeItem(key);
}

// utility  to clear all localstorage data
function clearAllData() {
    localStorage.clear();
}

// utility  to delete an item from localstorage by key and Id
function deleteItem(key, id) {
    const data = JSON.parse(localStorage.getItem(key)) || [];
    const filteredData = data.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(filteredData));
}

// utility  to export data to a CSV file
function exportToCSV(key, fileName = 'data.csv') {
    const data = JSON.parse(localStorage.getItem(key)) || [];
    if (data.length === 0) {
        alert("No data available to export.");
        return;
    }

    const headers = Object.keys(data[0]); 
    const rows = data.map(item => headers.map(header => JSON.stringify(item[header] || '')).join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}
// utility  to filter data from local storage by a specific field or value
function filterData(key, field, value) {
    const data = JSON.parse(localStorage.getItem(key)) || [];
    return data.filter(item => item[field].toLowerCase().includes(value.toLowerCase()));
}

// exporting utility 
export { getData, saveData, resetData, clearAllData, deleteItem, exportToCSV, filterData };
