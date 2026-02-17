import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const formatIndianDate = (date) => {
    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const stripTime = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());


function EnrollmentReport() {
    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        const fetchData = () => {
            console.log("Refreshing...");

            fetch("https://kaizenvoiz.ai/dashboardwebapi/api/Dashboard/all")
                .then((res) => res.json())
                .then((raw) => {
                    console.log("API Data:", raw);
                    const formatted = raw.map((item) => ({
                        id: item.id,
                        empId: item.employerId,
                        name: item.name,
                        status: item.checkIn,
                        date: formatIndianDate(new Date(item.inDateTime)),
                        rawDate: new Date(item.inDateTime)
                    }));


                    setData(formatted);

                })
                .catch((err) => {
                    console.error("API fetch error:", err);
                    setData([]);
                });
        };

        fetchData();
        const interval = setInterval(fetchData, 3000);

        return () => clearInterval(interval);
    }, []);



    const resetFilters = () => {
        setSearch("");
        setStartDate(null);
        setEndDate(null);
    };

    const filteredData = data.filter((row) => {
        const matchesSearch =
            search === "" ||
            Object.values(row).some((value) =>
                String(value).toLowerCase().includes(search.toLowerCase())
            );

        const start = startDate ? stripTime(startDate) : null;
        const end = endDate ? stripTime(endDate) : null;
        const rowDate = stripTime(row.rawDate);

        const matchesStartDate = !start || rowDate >= start;
        const matchesEndDate = !end || rowDate <= end;

        return matchesSearch && matchesStartDate && matchesEndDate;
    });

    // CSV download
    const downloadCSV = (heading) => {
        const header = ["Serial No.", "Emp ID", "Name", "Status", "Date/Time"];

        const rows = [];
        rows.push(["TRANSACTION DETAILS"]);
        rows.push([]);
        rows.push(header);


        filteredData.forEach((r) => {
            rows.push([r.id, r.empId, r.name, r.status, r.date]);
        });


        const csv = rows
            .map((cols) =>
                cols
                    .map((cell) => {
                        const s = cell === null || cell === undefined ? "" : String(cell);
                        return `"${s.replace(/"/g, '""')}"`;
                    })
                    .join(",")
            )
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, `Transaction details.csv`);
    };


    //  Excel download 
    const downloadExcel = async (heading) => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Report");


        sheet.mergeCells("A1:E4");
        try {
            const res = await fetch(`${process.env.PUBLIC_URL}/logoo.png`);
            if (!res.ok) throw new Error("Logo not found");
            const arrayBuffer = await res.arrayBuffer();
            const imageId = workbook.addImage({ buffer: arrayBuffer, extension: "png" });


            sheet.addImage(imageId, { tl: { col: 1.5, row: 0.5 }, br: { col: 4.5, row: 3.5 } });
        } catch (err) {
            console.warn("Could not load logo:", err);
        }


        sheet.mergeCells("A5:E7");
        const titleCell = sheet.getCell("A5");
        titleCell.value = heading || "Transaction Details";
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        titleCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: "FF0070C0" } };


        const headerRowIndex = 8;
        sheet.getRow(headerRowIndex).values = [
            "Serial No.", "Emp ID", "Name", "Status", "Date/Time"
        ];
        sheet.getRow(headerRowIndex).eachCell(cell => {
            cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0070C0" } };
            cell.border = {
                top: { style: "thin" }, left: { style: "thin" },
                bottom: { style: "thin" }, right: { style: "thin" }
            };
        });


        const startDataRow = headerRowIndex + 1;
        filteredData.forEach((r) => {
            const row = sheet.addRow([r.id, r.empId, r.name, r.status, r.date]);

            row.eachCell((cell) => {
                cell.alignment = { horizontal: "center", vertical: "middle" };
            });
        });



        sheet.columns.forEach((column, i) => {
            let maxLength = 10;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const val = cell.value ? String(cell.value) : "";
                if (val.length > maxLength) maxLength = val.length;
            });
            column.width = Math.min(60, maxLength + 5);
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        saveAs(blob, `Transaction details.xlsx`);
    };
    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);


    return (
        <div className="container-fluid mt-4">
            <div className="card shadow rounded-3">
                <div
                    className="card-header d-flex justify-content-between align-items-center"
                    style={{ backgroundColor: "rgb(217, 218, 218)", color: "rgb(48, 45, 45)" }}
                >
                    <h4 className="mb-0">Transaction Details</h4>
                    <div className="d-flex align-items-center">
                        <span title="Download Excel">
                            <i
                                className="fas fa-file-excel fa-2x text-success me-3"
                                style={{ cursor: "pointer" }}
                                onClick={() => downloadExcel("Transaction Details")}
                            ></i>
                        </span>
                        <span title="Download CSV">
                            <i
                                className="fas fa-file-csv fa-2x text-primary"
                                style={{ cursor: "pointer" }}
                                onClick={() => downloadCSV("Transaction Details")}
                            ></i>
                        </span>
                    </div>
                </div>

                <div className="card-body">

                    <div className="row mb-4 g-3 align-items-end">
                        <div className="col-md-4">
                            <label className="form-label fw-semibold">Search</label>
                            <input
                                type="text"
                                className="form-control shadow-sm"
                                placeholder="Search by any field..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">Start Date</label>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                className="form-control shadow-sm"
                                placeholderText="Select start date"
                                dateFormat="dd/MM/yyyy"
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">End Date</label>
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                className="form-control shadow-sm"
                                placeholderText="Select end date"
                                dateFormat="dd/MM/yyyy"
                            />
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            <button
                                className="btn reset-btn btn-sm px-3 shadow-sm"
                                onClick={resetFilters}
                            >
                                Reset
                            </button>
                        </div>

                    </div>
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover align-middle">
                            <thead>
                                <tr>
                                    <th style={{ backgroundColor: "#e5e5e5", color: "#2c2727" }}>Serial No.</th>
                                    <th style={{ backgroundColor: "#e5e5e5", color: "#2c2727" }}>Emp ID</th>
                                    <th style={{ backgroundColor: "#e5e5e5", color: "#2c2727" }}>Name</th>
                                    <th style={{ backgroundColor: "#e5e5e5", color: "#2c2727" }}>Status</th>
                                    <th style={{ backgroundColor: "#e5e5e5", color: "#2c2727" }}>Date/Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.length > 0 ? (
                                    currentData.map((row, index) => (
                                        <tr key={index}>
                                            <td className="text-center">{row.id}</td>
                                            <td>{row.empId}</td>
                                            <td>{row.name}</td>

                                            <td
                                                className={`fw-bold text-center ${row.status === "Success"
                                                    ? "text-success"
                                                    : "text-danger"
                                                    }`}
                                            >
                                                {row.status}
                                            </td>
                                            <td>{row.date}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted">
                                            No records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination with ellipses - Medium size */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-3">
                            <div className="d-flex align-items-center me-3">
                                <span className="me-2">Rows per page:</span>
                                <select
                                    className="form-select form-select-sm"
                                    style={{ width: "auto" }}
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            <nav>
                                <ul className="pagination mb-0">
                                    {/* Prev button */}
                                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                        <button
                                            className="page-link"
                                            style={{
                                                borderRadius: "6px",
                                                margin: "0 3px",
                                                minWidth: "36px",
                                                textAlign: "center",
                                                border: "1px solid #ddd",
                                                color: "#333",
                                                padding: "4px 8px",
                                            }}
                                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        >
                                            &lt;
                                        </button>
                                    </li>

                                    {/* Page numbers with ellipses */}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter((page) => {
                                            return (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                            );
                                        })
                                        .reduce((acc, page, idx, arr) => {
                                            if (idx > 0 && page - arr[idx - 1] > 1) {
                                                acc.push("ellipsis");
                                            }
                                            acc.push(page);
                                            return acc;
                                        }, [])
                                        .map((item, idx) =>
                                            item === "ellipsis" ? (
                                                <li key={idx} className="page-item disabled">
                                                    <span
                                                        className="page-link"
                                                        style={{
                                                            borderRadius: "6px",
                                                            margin: "0 3px",
                                                            minWidth: "36px",
                                                            textAlign: "center",
                                                            border: "1px solid #ddd",
                                                            color: "#333",
                                                            padding: "4px 8px",
                                                        }}
                                                    >
                                                        ...
                                                    </span>
                                                </li>
                                            ) : (
                                                <li
                                                    key={idx}
                                                    className={`page-item ${currentPage === item ? "active" : ""}`}
                                                >
                                                    <button
                                                        className="page-link"
                                                        style={{
                                                            borderRadius: "6px",
                                                            margin: "0 3px",
                                                            minWidth: "36px",
                                                            textAlign: "center",
                                                            border: "1px solid #ddd",
                                                            color:
                                                                currentPage === item ? "#6c63ff" : "#333",
                                                            fontWeight: currentPage === item ? "bold" : "normal",
                                                            backgroundColor: currentPage === item ? "white" : "transparent",
                                                            padding: "4px 8px",
                                                        }}
                                                        onClick={() => setCurrentPage(item)}
                                                    >
                                                        {item}
                                                    </button>
                                                </li>
                                            )
                                        )}

                                    {/* Next button */}
                                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                        <button
                                            className="page-link"
                                            style={{
                                                borderRadius: "6px",
                                                margin: "0 3px",
                                                minWidth: "36px",
                                                textAlign: "center",
                                                border: "1px solid #ddd",
                                                color: "#333",
                                                padding: "4px 8px",
                                            }}
                                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        >
                                            &gt;
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EnrollmentReport;
