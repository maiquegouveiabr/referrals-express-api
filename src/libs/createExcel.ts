import ExcelJS from "exceljs";

interface Data {
  personGuid?: string;
  firstName?: string;
  phoneNumber?: string;
  areaName?: string;
  personStatus?: string;
  inviteDate: string;
}

export async function createExcel(data: Data[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data");

  // Define header row
  worksheet.columns = [
    { header: "ID", key: "personGuid", width: 40 },
    { header: "First Name", key: "firstName", width: 15 },
    { header: "Phone Number", key: "phoneNumber", width: 25 },
    { header: "Teaching Area", key: "areaName", width: 25 },
    { header: "Person Status", key: "personStatus", width: 40 },
    { header: "Invite Date", key: "inviteDate", width: 25 },
  ];

  // Add rows
  data.forEach((item) => worksheet.addRow(item));

  // Optional: style header row
  worksheet.getRow(1).font = { bold: true };

  // Save file
  const outputPath = "./data.xlsx";
  await workbook.xlsx.writeFile(outputPath);

  console.log(`✅ Excel file created: ${outputPath}`);
}
