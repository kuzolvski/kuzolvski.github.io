let currentPage = 1;
const rowsPerPage = 10;
let commissionsData = [];
let filteredData = []; // New array to hold filtered data

function paginateTable(tableId, page) {
  const table = document.getElementById(tableId);
  const rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
  const totalPages = Math.ceil(rows.length / rowsPerPage);

  for (let i = 0; i < rows.length; i++) {
    rows[i].style.display = "none"; // Hide all rows
  }

  for (let i = (page - 1) * rowsPerPage; i < page * rowsPerPage && i < rows.length; i++) {
    rows[i].style.display = ""; // Show rows for the current page
  }

  document.getElementById(`${tableId}-prev`).disabled = page === 1; // Disable previous button on first page
  document.getElementById(`${tableId}-next`).disabled = page === totalPages; // Disable next button on last page
}

function changePage(tableId, direction) {
  const totalPages = Math.ceil(filteredData.length / rowsPerPage); // Use filtered data length

  currentPage += direction; // Change the current page by direction
  if (currentPage < 1) currentPage = 1; // Prevent going to a page less than 1
  if (currentPage > totalPages) currentPage = totalPages; // Prevent going to a page greater than total pages

  paginateTable(tableId, currentPage); // Call paginateTable to update the display
}

document.addEventListener("DOMContentLoaded", () => {
  loadGoogleSheetData(); // Load data when the DOM is fully loaded
});

function loadGoogleSheetData() {
  fetch("https://script.google.com/macros/s/AKfycbzwxGvC7bRWRc2yRyrgib9F7IOvtuw3Qx69Z8Qt8I7LDaU-PDKjBka8IVbHKtHW9flx/exec") // Replace with your web app URL
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      commissionsData = data; // Store the fetched data
      filteredData = commissionsData; // Initialize filtered data
      currentPage = 1; // Reset current page to 1
      populateCommissionsTable(); // Populate the table with data
      paginateTable("commissions-table", currentPage); // Paginate the table
    })
    .catch((error) => console.error("Error fetching data:", error));
}

function populateCommissionsTable() {
  const tableBody = document.querySelector("#commissions-table tbody");
  tableBody.innerHTML = ""; // Clear existing rows

  const dataToDisplay = filteredData.length > 0 ? filteredData : commissionsData; // Use filtered data if available

  dataToDisplay.forEach((item) => {
    const row = document.createElement("tr");
    const progressValue = item.progress; // Assuming progress is a string like "Sketching", "Rendering", or "Finished"
    const progressPercentage = getProgressPercentage(progressValue); // Get the percentage based on the progress

    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.status !== undefined ? item.status : "N/A"}</td> <!-- New Status data -->
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
    tableBody.appendChild(row); // Append the new row to the table body
  });
}

function filterTable(tableId, filterId) {
  const input = document.getElementById(filterId);
  const filter = input.value.toLowerCase();

  // Filter the commissionsData based on the input
  filteredData = commissionsData.filter((item) => {
    return Object.values(item).some((value) => String(value).toLowerCase().includes(filter));
  });

  currentPage = 1; // Reset to the first page after filtering
  populateCommissionsTable(); // Populate the table with filtered data
  paginateTable(tableId, currentPage); // Update pagination based on filtered data
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
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}
