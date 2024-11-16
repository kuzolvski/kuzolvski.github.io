let currentPage = 1;
const rowsPerPage = 10;
let historyData = [];
let filteredData = []; // New array to hold filtered data

async function fetchData() {
  const response = await fetch("https://script.google.com/macros/s/AKfycbzrXUb_Sb_QhELUwkfQzo34gKgX04HXW2qxRA-ndWeSydz1DXVMEsVdJMgqcJ1-8jfYng/exec"); // Replace with your web app URL
  const data = await response.json();
  historyData = data; // Store the fetched data
  filteredData = historyData; // Initialize filtered data
  renderTable(); // Render the table after fetching data
}

function formatDate(dateString) {
  if (dateString === "-") {
    return "-"; // Return "-" if the input is "-"
  }
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
}

function renderTable() {
  const tableBody = document.querySelector("#history-table tbody");
  tableBody.innerHTML = ""; // Clear existing rows

  const dataToDisplay = filteredData.length > 0 ? filteredData : historyData; // Use filtered data if available
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = dataToDisplay.slice(start, end);

  paginatedData.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${item.name}</td>
            <td>${formatDate(item.startDate)}</td>
            <td>${item.type}</td>
            <td>${item.status}</td>
        `;
    tableBody.appendChild(row);
  });

  document.getElementById("history-table-prev").disabled = currentPage === 1;
  document.getElementById("history-table-next").disabled = currentPage === Math.ceil(dataToDisplay.length / rowsPerPage);

  renderPageNumbers(dataToDisplay.length);
}

function renderPageNumbers(totalItems) {
  const pageNumbersContainer = document.getElementById("page-numbers");
  pageNumbersContainer.innerHTML = "";
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const maxVisiblePages = 3; // Maximum number of page buttons to show
  let startPage, endPage;

  if (totalPages <= maxVisiblePages) {
    startPage = 1;
    endPage = totalPages;
  } else {
    const halfVisible = Math.floor(maxVisiblePages / 2);
    startPage = Math.max(1, currentPage - halfVisible);
    endPage = Math.min(totalPages, currentPage + halfVisible);

    if (startPage === 1) {
      endPage = Math.min(maxVisiblePages, totalPages);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.innerText = i;
    pageButton.className = currentPage === i ? "active" : "";
    pageButton.onclick = () => {
      currentPage = i;
      renderTable(); // Re-render the table with the new page
    };
    pageNumbersContainer.appendChild(pageButton);
  }
}

function changePage(direction) {
  const totalItems = filteredData.length > 0 ? filteredData.length : historyData.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  if (direction === "first") {
    currentPage = 1; // Go to the first page
  } else if (direction === "last") {
    currentPage = totalPages; // Go to the last page
  } else {
    currentPage += direction; // For next and previous buttons
  }

  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  renderTable(); // Call renderTable to update the display
}

function displayNoRecordsMessage() {
  const tableBody = document.querySelector("#history-table tbody");
  tableBody.innerHTML = "<tr><td colspan='6'>No records available.</td></tr>";
  document.getElementById("history-table-prev").disabled = true;
  document.getElementById("history-table-next").disabled = true;
}

// Function to filter the table based on user input
function filterTable(tableId, filterId) {
  const input = document.getElementById(filterId);
  const filter = input.value.toLowerCase();

  // Filter the historyData based on the input
  filteredData = historyData.filter((item) => {
    return Object.values(item).some((value) => String(value).toLowerCase().includes(filter));
  });

  currentPage = 1;
  if (filteredData.length === 0) {
    displayNoRecordsMessage();
  } else {
    renderTable();
  } // Reset to the first page after filtering // Render the table with filtered data
}

// Call fetchData when the page loads
window.onload = fetchData;
