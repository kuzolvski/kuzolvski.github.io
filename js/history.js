let currentPage = 1;
const rowsPerPage = 10;
let historyData = [];
let filteredData = [];

async function fetchData() {
  const response = await fetch("https://script.google.com/macros/s/AKfycbzrXUb_Sb_QhELUwkfQzo34gKgX04HXW2qxRA-ndWeSydz1DXVMEsVdJMgqcJ1-8jfYng/exec");
  const data = await response.json();
  historyData = data;
  filteredData = historyData;
  renderTable();
}

function formatDate(dateString) {
  if (dateString === "-") {
    return "-";
  }
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
}

function renderTable() {
  const tableBody = document.querySelector("#history-table tbody");

  // Clear the table body without affecting the header
  tableBody.innerHTML = "";

  const dataToDisplay = filteredData.length > 0 ? filteredData : historyData;
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = dataToDisplay.slice(start, end);

  if (paginatedData.length === 0) {
    displayNoRecordsMessage();
    return;
  }

  // Add empty rows to fill the table with consistent height
  const totalRows = rowsPerPage;

  for (let i = 0; i < totalRows; i++) {
    const row = document.createElement("tr");
    if (i < paginatedData.length) {
      // Add actual data
      const item = paginatedData[i];
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${formatDate(item.startDate)}</td>
        <td>${item.type}</td>
        <td>${item.status}</td>
      `;
    } else {
      // Add empty row to maintain table height
      row.innerHTML = `
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      `;
      row.style.visibility = "hidden"; // Hide empty rows but maintain space
    }
    tableBody.appendChild(row);
  }

  // Update pagination buttons state
  document.getElementById("history-table-prev").disabled = currentPage === 1;
  document.getElementById("history-table-first").disabled = currentPage === 1;

  const totalPages = Math.ceil(dataToDisplay.length / rowsPerPage);
  document.getElementById("history-table-next").disabled = currentPage === totalPages || totalPages === 0;
  document.getElementById("history-table-last").disabled = currentPage === totalPages || totalPages === 0;

  renderPageNumbers(dataToDisplay.length);

  // Fix header and ensure consistent width
  fixTableHeader();
}

function fixTableHeader() {
  // Ensure the headers have consistent width
  const table = document.getElementById("history-table");
  const ths = table.querySelectorAll("thead th");
  const firstRowCells = table.querySelectorAll("tbody tr:first-child td");

  // Only proceed if both header and body cells exist
  if (ths.length > 0 && firstRowCells.length > 0) {
    // Force table to calculate widths correctly
    table.style.tableLayout = "fixed";

    // Ensure the thead is properly positioned
    const thead = table.querySelector("thead");
    thead.style.position = "sticky";
    thead.style.top = "0";
    thead.style.zIndex = "10";
  }
}

function renderPageNumbers(totalItems) {
  const pageNumbersContainer = document.getElementById("page-numbers");
  pageNumbersContainer.innerHTML = "";
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  if (totalPages === 0) {
    return;
  }

  const maxVisiblePages = window.innerWidth < 440 ? 1 : 3;
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
      renderTable();
    };
    pageNumbersContainer.appendChild(pageButton);
  }
}

function changePage(direction) {
  const totalItems = filteredData.length > 0 ? filteredData.length : historyData.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  if (direction === "first") {
    currentPage = 1;
  } else if (direction === "last") {
    currentPage = totalPages;
  } else {
    currentPage += direction;
  }

  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  renderTable();
}

function displayNoRecordsMessage() {
  const tableBody = document.querySelector("#history-table tbody");
  const headerCells = document.querySelectorAll("#history-table thead th").length;

  // Create a single row with the message
  tableBody.innerHTML = `<tr><td colspan="${headerCells}">No records available.</td></tr>`;

  // Add additional empty rows to maintain table height
  for (let i = 1; i < rowsPerPage; i++) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="${headerCells}">&nbsp;</td>`;
    row.style.visibility = "hidden"; // Hide empty rows but maintain space
    tableBody.appendChild(row);
  }

  document.getElementById("history-table-prev").disabled = true;
  document.getElementById("history-table-next").disabled = true;
  document.getElementById("history-table-first").disabled = true;
  document.getElementById("history-table-last").disabled = true;
}

function filterTable(tableId, filterId) {
  const input = document.getElementById(filterId);
  const filter = input.value.toLowerCase();

  // Filter the historyData based on the input
  filteredData = historyData.filter((item) => {
    return Object.values(item).some((value) => String(value).toLowerCase().includes(filter));
  });

  currentPage = 1; // Reset to first page after filtering
  renderTable();
}

// Add window resize listener to handle table adjustments
window.addEventListener("resize", () => {
  renderPageNumbers(filteredData.length > 0 ? filteredData.length : historyData.length);
  fixTableHeader();
});

// Call fetchData when the page loads
window.onload = fetchData;
