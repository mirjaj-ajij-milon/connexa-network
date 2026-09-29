import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const convertUserDataToPdf = async (userData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `resume-${crypto.randomBytes(16).toString("hex")}.pdf`;
      const uploadDir = path.resolve("uploads");
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Add profile picture if exists
      if (
        userData?.userId?.profilePicture &&
        userData.userId.profilePicture !== "default.jpg"
      ) {
        const picPath = path.join(uploadDir, userData.userId.profilePicture);
        if (fs.existsSync(picPath)) {
          try {
            doc.image(picPath, {
              fit: [100, 100],
              align: "center",
            });
            doc.moveDown();
          } catch (e) {
            console.error("PDF image add failed:", e.message);
          }
        }
      }

      // Title & User details
      doc.fontSize(20).text("Professional Resume", { align: "center" });
      doc.moveDown();
      doc.fontSize(14).text(`Name: ${userData?.userId?.name || "N/A"}`);
      doc.fontSize(12).text(`Username: ${userData?.userId?.username || "N/A"}`);
      doc.fontSize(12).text(`Email: ${userData?.userId?.email || "N/A"}`);
      doc.moveDown(0.5);

      doc.fontSize(12).text(`Bio: ${userData?.bio || "N/A"}`);
      doc.fontSize(12).text(`Current Position: ${userData?.currentPost || "N/A"}`);
      doc.moveDown();

      // Work experience
      if (userData?.pastWork?.length > 0) {
        doc.fontSize(14).text("Past Work Experience:", { underline: true });
        doc.moveDown(0.5);
        userData.pastWork.forEach((work, index) => {
          doc.fontSize(11).text(`${index + 1}. ${work.position || 'N/A'} at ${work.company || 'N/A'}`);
          doc.text(`   Experience: ${work.years || 'N/A'}`);
          doc.moveDown(0.3);
        });
        doc.moveDown();
      }

      // Education
      if (userData?.education?.length > 0) {
        doc.fontSize(14).text("Education:", { underline: true });
        doc.moveDown(0.5);
        userData.education.forEach((edu, index) => {
          const schoolName = edu.school || edu.schole || "N/A";
          const field = edu.fieldOfStudy || edu.feildOfStudy || "N/A";
          doc.fontSize(11).text(`${index + 1}. ${edu.degree || 'N/A'} in ${field}`);
          doc.text(`   Institution: ${schoolName}`);
          doc.moveDown(0.3);
        });
      }

      doc.end();

      stream.on("finish", () => resolve(filename));
      stream.on("error", (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

export default convertUserDataToPdf;
