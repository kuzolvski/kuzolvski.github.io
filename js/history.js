let currentPage = 1;
const rowsPerPage = 10;
let historyData = [];
let filteredData = []; // New array to hold filtered data

// Function to fetch data from Google Sheets
async function fetchData() {
  const response = await fetch("https://script.google.com/macros/s/AKfycbzrXUb_Sb_QhELUwkfQzo34gKgX04HXW2qxRA-ndWeSydz1DXVMEsVdJMgqcJ1-8jfYng/exec"); // Replace with your web app URL
  const data = await response.json();
  historyData = data; // Store the fetched data
  filteredData = historyData; // Initialize filtered data
  renderTable(); // Render the table after fetching data
}

// Function to format the date to "DD-MMM-YYYY"
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-GB", options).replace(/ /g, "-"); // Replace spaces with hyphens
}

// Function to render the table based on the current page
function renderTable() {
  const tableBody = document.querySelector("#history-table tbody");
  tableBody.innerHTML = ""; // Clear existing rows

  // Calculate the start and end index for the current page
  const dataToDisplay = filteredData.length > 0 ? filteredData : historyData; // Use filtered data if available
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = dataToDisplay.slice(start, end);

  // Populate the table with the current page data
  paginatedData.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${item.name}</td>
            <td>${formatDate(item.startDate)}</td> <!-- Format the start date -->
            <td>${item.type}</td>
            <td>${item.status}</td>
    `;
    tableBody.appendChild(row);
  });

  // Update pagination buttons
  document.getElementById("history-table-prev").disabled = currentPage === 1;
  document.getElementById("history-table-next").disabled = currentPage === Math.ceil(dataToDisplay.length / rowsPerPage);
}

// Function to change the page
function changePage(direction) {
  const totalPages = Math.ceil(filteredData.length > 0 ? filteredData.length : historyData.length / rowsPerPage);
  currentPage += direction;

  // Ensure currentPage stays within bounds
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  renderTable(); // Re-render the table with the new page
}

// Function to filter the table based on the input
function filterTable(tableId, filterId) {
  const input = document.getElementById(filterId);
  const filter = input.value.toLowerCase();

  // Filter the historyData based on the input
  filteredData = historyData.filter((item) => {
    return Object.values(item).some((value) => String(value).toLowerCase().includes(filter));
  });

  currentPage = 1; // Reset to the first page after filtering
  renderTable(); // Render the table with filtered data
}

// Call fetchData when the page loads
window.onload = fetchData;
