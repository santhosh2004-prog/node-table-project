async function addEntry() {
  const id = document.getElementById("idInput").value;
  const name = document.getElementById("nameInput").value;
  const sales = document.getElementById("salesInput").value;

  if (!id || !name || !sales) {
    alert("Please fill all fields!");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/addSale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, sales })
    });

    const result = await response.json();
    alert(result.message || "Data submitted!");  

    // Clear inputs
    document.getElementById("idInput").value = "";
    document.getElementById("nameInput").value = "";
    document.getElementById("salesInput").value = "";

  } catch (err) {
    console.error(err);
    alert("Error submitting data");
  }
}

async function analyzeData() {
  try {
    // ✅ 1. Fetch all sales rows
    const salesResponse = await fetch("http://localhost:5000/getSales");
    const salesData = await salesResponse.json();

    const table = document.getElementById("salesTable").getElementsByTagName("tbody")[0];
    table.innerHTML = "";

    // Add input row back
    const inputRow = table.insertRow();
    inputRow.innerHTML = `
      <td><input type="number" id="idInput" placeholder="Enter ID"></td>
      <td><input type="text" id="nameInput" placeholder="Enter Name"></td>
      <td><input type="number" id="salesInput" placeholder="Enter Sales"></td>
    `;

    // ✅ 2. Populate table with DB rows
    salesData.forEach(row => {
      const newRow = table.insertRow();
      newRow.insertCell(0).textContent = row.id;
      newRow.insertCell(1).textContent = row.name;
      newRow.insertCell(2).textContent = row.sales;
    });

    // ✅ 3. Fetch category analysis
    const analysisResponse = await fetch("http://localhost:5000/analyzeSales");
    const analysisData = await analysisResponse.json();

    let resultHTML = "<h3> Sales Categories</h3>";
    analysisData.forEach(row => {
      resultHTML += `${row.category.toUpperCase()}: ${row.totalscore} <br>`;
    });

    document.getElementById("analysis").innerHTML = resultHTML;

  } catch (err) {
    console.error(err);
    alert("Error analyzing sales data");
  }
}
