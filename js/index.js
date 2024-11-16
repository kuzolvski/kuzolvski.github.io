let currentPage = 1;
const rowsPerPage = 10;
let commissionsData = [];
let filteredData = []; // New array to hold filtered data

function paginateTable(tableId, page) {
  const table = document.getElementById(tableId);
  const rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");

  // Calculate total pages based on filtered data or original data
  const totalData = filteredData.length > 0 ? filteredData.length : commissionsData.length;
  const totalPages = Math.ceil(totalData / rowsPerPage);

  // Hide all rows
  for (let i = 0; i < rows.length; i++) {
    rows[i].style.display = "none";
  }

  // Show rows for the current page
  for (let i = (page - 1) * rowsPerPage; i < page * rowsPerPage && i < totalData; i++) {
    rows[i].style.display = "";
  }

  // Disable buttons based on the current page
  document.getElementById("commissions-table-prev").disabled = page === 1;
  document.getElementById("commissions-table-next").disabled = page === totalPages;

  renderPageNumbers(totalPages);
}

function renderPageNumbers(totalPages) {
  const pageNumbersContainer = document.getElementById("page-numbers");
  pageNumbersContainer.innerHTML = "";

  const maxVisiblePages = 3;
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
      paginateTable("commissions-table", currentPage);
    };
    pageNumbersContainer.appendChild(pageButton);
  }
}

function changePage(tableId, direction) {
  const totalData = filteredData.length > 0 ? filteredData.length : commissionsData.length;
  const totalPages = Math.ceil(totalData / rowsPerPage);

  if (direction === "first") {
    currentPage = 1;
  } else if (direction === "last") {
    currentPage = totalPages;
  } else {
    currentPage += direction;
  }

  // Ensure currentPage stays within bounds
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  paginateTable(tableId, currentPage);
}

document.addEventListener("DOMContentLoaded", () => {
  loadGoogleSheetData();
});

function loadGoogleSheetData() {
  fetch("https://script.google.com/macros/s/AKfycbzwxGvC7bRWRc2yRyrgib9F7IOvtuw3Qx69Z8Qt8I7LDaU-PDKjBka8IVbHKtHW9flx/exec")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      commissionsData = data;
      filteredData = commissionsData;
      currentPage = 1;
      if (commissionsData.length === 0) {
        displayNoRecordsMessage();
      } else {
        populateCommissionsTable();
        paginateTable("commissions-table", currentPage);
      }
    })
    .catch((error) => console.error("Error fetching data:", error));
}

function displayNoRecordsMessage() {
  const tableBody = document.querySelector("#commissions-table tbody");
  tableBody.innerHTML = "<tr><td colspan='6'>No records available.</td></tr>";
  document.getElementById("commissions-table-prev").disabled = true;
  document.getElementById("commissions-table-next").disabled = true;
}

function populateCommissionsTable() {
  const tableBody = document.querySelector("#commissions-table tbody");
  tableBody.innerHTML = "";

  const dataToDisplay = filteredData.length > 0 ? filteredData : commissionsData;

  dataToDisplay.forEach((item) => {
    const row = document.createElement("tr");
    const progressValue = item.progress;
    const progressPercentage = getProgressPercentage(progressValue);

    const statusClass = item.status.toLowerCase() === "confirmed" ? "status-confirmed" : "";

    row.innerHTML = `
            <td>${item.name}</td>
            <td class="${statusClass}">${item.status !== undefined ? item.status : "N/A"}</td>
            <td>${formatDate(item.startDate)}</td>
            <td>${item.type}</td>
            <td>${item.estimatedTime !== undefined ? item.estimatedTime : "N/A"}</td>
            <td>
                ${progressValue !== undefined ? progressValue : "N/A"}
                <div class="progress-bar">
                    <div class="progress" style="width: ${progressPercentage}%;"></div>
                </div>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

function filterTable(tableId, filterId) {
  const input = document.getElementById(filterId);
  const filter = input.value.toLowerCase();

  filteredData = commissionsData.filter((item) => {
    return Object.values(item).some((value) => String(value).toLowerCase().includes(filter));
  });

  currentPage = 1;
  if (filteredData.length === 0) {
    displayNoRecordsMessage();
  } else {
    populateCommissionsTable();
    paginateTable(tableId, currentPage);
  }
}

function getProgressPercentage(progress) {
  switch (progress) {
    case "Sketching":
      return 33;
    case "Rendering":
      return 66;
    case "Finished":
      return 100;
    default:
      return 0;
  }
}

function formatDate(dateString) {
  if (dateString === "-") {
    return "-";
  }
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
}
