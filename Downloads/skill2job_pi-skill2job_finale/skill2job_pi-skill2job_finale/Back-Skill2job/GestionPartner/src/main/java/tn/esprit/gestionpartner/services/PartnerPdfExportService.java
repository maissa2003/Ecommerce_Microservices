package tn.esprit.gestionpartner.services;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.events.Event;
import com.itextpdf.kernel.events.IEventHandler;
import com.itextpdf.kernel.events.PdfDocumentEvent;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.pdf.extgstate.PdfExtGState;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.*;
import org.springframework.stereotype.Service;
import tn.esprit.gestionpartner.dto.PartnerResponse;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import com.itextpdf.layout.Canvas;
import com.itextpdf.layout.element.Image;
@Service
public class PartnerPdfExportService {

    // Brand (Skill2Job style)
    private static final DeviceRgb RED = new DeviceRgb(198, 40, 40);     // #c62828
    private static final DeviceRgb DARK = new DeviceRgb(18, 18, 18);
    private static final DeviceRgb GRAY = new DeviceRgb(120, 120, 120);
    private static final DeviceRgb LIGHT_BG = new DeviceRgb(247, 247, 247);
    private static final DeviceRgb BORDER = new DeviceRgb(236, 236, 236);

    public byte[] exportPartners(List<PartnerResponse> partners) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf, PageSize.A4);

            // Margins (premium spacing)
            doc.setMargins(72, 36, 55, 36);

            PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);

            String generatedAt = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

            // Header/Footer + Watermark (all pages)
            pdf.addEventHandler(PdfDocumentEvent.END_PAGE,
                    new PremiumHeaderFooter("Skill2Job — Partners Report", generatedAt, font));
            pdf.addEventHandler(PdfDocumentEvent.END_PAGE,
                    new WatermarkHandler("SKILL2JOB", font));

            // =========================
            // COVER PAGE (Premium)
            // =========================
            addCoverPage(doc, pdf, font, bold, partners.size(), generatedAt);

            // after cover
            doc.add(new AreaBreak(AreaBreakType.NEXT_PAGE));

            // =========================
            // EXEC SUMMARY + KPIs
            // =========================
            long approved = partners.stream().filter(p -> "APPROVED".equalsIgnoreCase(p.getStatus())).count();
            long pending = partners.stream().filter(p -> "PENDING".equalsIgnoreCase(p.getStatus())).count();
            long suspended = partners.stream().filter(p -> "SUSPENDED".equalsIgnoreCase(p.getStatus())).count();

            doc.add(sectionTitle("Executive Summary", bold));
            doc.add(new Paragraph("This report provides a structured overview of partner companies registered on the platform, including current status distribution and contact details. Use it for audits, approvals, and operational follow-ups.")
                    .setFont(font).setFontSize(10.5f).setFontColor(GRAY)
                    .setMarginTop(0).setMarginBottom(10));

            doc.add(kpiRow(partners.size(), approved, pending, suspended, bold, font));

            // =========================
            // STATUS DISTRIBUTION (mini chart)
            // =========================
            doc.add(sectionTitle("Status Distribution", bold));

            long max = Math.max(1, Math.max(approved, Math.max(pending, suspended)));
            Table dist = new Table(UnitValue.createPercentArray(new float[]{20, 60, 20}))
                    .useAllAvailableWidth()
                    .setMarginTop(6);

            dist.addCell(distHeadCell("Status", bold));
            dist.addCell(distHeadCell("Distribution", bold));
            dist.addCell(distHeadCell("Count", bold));

            dist.addCell(distLabelCell("APPROVED", bold));
            dist.addCell(distBarCell(approved, max, new DeviceRgb(40, 167, 69)));
            dist.addCell(distValueCell(String.valueOf(approved), bold));

            dist.addCell(distLabelCell("PENDING", bold));
            dist.addCell(distBarCell(pending, max, new DeviceRgb(162, 107, 0)));
            dist.addCell(distValueCell(String.valueOf(pending), bold));

            dist.addCell(distLabelCell("SUSPENDED", bold));
            dist.addCell(distBarCell(suspended, max, new DeviceRgb(220, 53, 69)));
            dist.addCell(distValueCell(String.valueOf(suspended), bold));

            doc.add(dist);
            doc.add(space(6));

            // =========================
            // PARTNERS TABLE (Premium zebra)
            // =========================
            doc.add(sectionTitle("Partners List", bold));
            doc.add(new Paragraph("Overview of partner companies registered on the Skill2Job platform, including their contact details and current approval status.")
                    .setFont(font).setFontSize(10.2f).setFontColor(GRAY)
                    .setMarginTop(0).setMarginBottom(10));

            Table table = new Table(UnitValue.createPercentArray(new float[]{22, 14, 22, 12, 10, 20}))
                    .useAllAvailableWidth();

            addTableHeader(table, "Company", bold);
            addTableHeader(table, "Industry", bold);
            addTableHeader(table, "Email", bold);
            addTableHeader(table, "Phone", bold);
            addTableHeader(table, "Status", bold);
            addTableHeader(table, "Website", bold);

            boolean zebra = false;
            for (PartnerResponse p : partners) {
                zebra = !zebra;

                table.addCell(bodyCell(safe(p.getCompanyName()), font, zebra));
                table.addCell(bodyCell(safe(p.getIndustry()), font, zebra));
                table.addCell(bodyCell(safe(p.getCompanyEmail()), font, zebra));
                table.addCell(bodyCell(safe(p.getPhone()), font, zebra));
                table.addCell(statusPillCell(safe(p.getStatus()), bold, zebra));
                table.addCell(bodyCell(safe(p.getWebsite()), font, zebra));
            }

            doc.add(table);

            // =========================
            // FOOT NOTE
            // =========================
            doc.add(space(10));
            doc.add(new Paragraph("Confidential — Internal Use Only")
                    .setFont(font).setFontSize(9).setFontColor(new DeviceRgb(160, 160, 160))
                    .setTextAlignment(TextAlignment.CENTER));

            doc.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("PDF export failed: " + e.getMessage(), e);
        }
    }

    // =========================
    // Cover page
    // =========================
    private void addCoverPage(Document doc, PdfDocument pdf, PdfFont font, PdfFont bold, int total, String generatedAt) {

        // Big top accent bar
        Table bar = new Table(1).useAllAvailableWidth();
        bar.addCell(new Cell().setHeight(18).setBackgroundColor(RED).setBorder(Border.NO_BORDER));
        doc.add(bar);

        doc.add(space(18));

        // Optional logo (if you have /static/logo.png in resources)
        // Put your logo file at: src/main/resources/static/logo.png
        try {
            ImageData img = ImageDataFactory.create(this.getClass().getResource("/static/logo.png"));
            Image logo = new Image(img).setWidth(120);
            doc.add(logo.setMarginBottom(12));
        } catch (Exception ignore) {
            // no logo -> continue
        }

        doc.add(new Paragraph("Partners Report")
                .setFont(bold).setFontSize(28).setFontColor(DARK)
                .setMargin(0));

        doc.add(new Paragraph("Skill2Job — Administration Export")
                .setFont(font).setFontSize(12).setFontColor(GRAY)
                .setMarginTop(6).setMarginBottom(16));

        // Premium info cards
        Table info = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                .useAllAvailableWidth();

        info.addCell(infoCard("Generated At", generatedAt, bold, font));
        info.addCell(infoCard("Total Partners", String.valueOf(total), bold, font));

        doc.add(info);
        doc.add(space(14));

        // Premium subtitle block
        Div box = new Div()
                .setBackgroundColor(LIGHT_BG)
                .setBorder(new SolidBorder(BORDER, 1))
                .setBorderRadius(new BorderRadius(14))
                .setPadding(14);

        box.add(new Paragraph("What’s inside")
                .setFont(bold).setFontSize(12).setFontColor(DARK)
                .setMargin(0));

        com.itextpdf.layout.element.List pdfList =
                new com.itextpdf.layout.element.List()
                        .setFont(font)
                        .setFontSize(10);

        pdfList.add("Executive summary + KPIs");
        pdfList.add("Status distribution chart");
        pdfList.add("Full partners list (print-friendly)");

        box.add(pdfList);

        doc.add(box);

        // Bottom accent
        doc.add(new Paragraph("\n"));
        Table bottom = new Table(1).useAllAvailableWidth();
        bottom.addCell(new Cell().setHeight(6).setBackgroundColor(new DeviceRgb(245, 245, 245)).setBorder(Border.NO_BORDER));
        doc.add(bottom);
    }

    private Cell infoCard(String k, String v, PdfFont bold, PdfFont font) {
        Paragraph pk = new Paragraph(k).setFont(font).setFontSize(10).setFontColor(GRAY).setMargin(0);
        Paragraph pv = new Paragraph(v).setFont(bold).setFontSize(16).setFontColor(DARK).setMargin(0);

        return new Cell()
                .add(pk).add(pv)
                .setPadding(14)
                .setBorder(new SolidBorder(BORDER, 1))
                .setBorderRadius(new BorderRadius(14))
                .setBackgroundColor(ColorConstants.WHITE);
    }

    // =========================
    // Sections & components
    // =========================
    private Paragraph sectionTitle(String t, PdfFont bold) {
        return new Paragraph(t)
                .setFont(bold)
                .setFontSize(14)
                .setFontColor(DARK)
                .setMarginTop(8)
                .setMarginBottom(6);
    }

    private Paragraph space(float mt) {
        return new Paragraph(" ").setMarginTop(mt).setMarginBottom(0);
    }

    private Table kpiRow(long total, long approved, long pending, long suspended, PdfFont bold, PdfFont font) {
        Table kpis = new Table(UnitValue.createPercentArray(new float[]{25, 25, 25, 25}))
                .useAllAvailableWidth()
                .setMarginTop(6)
                .setMarginBottom(10);

        kpis.addCell(kpiCell("Total", String.valueOf(total), bold, font, DARK));
        kpis.addCell(kpiCell("Approved", String.valueOf(approved), bold, font, new DeviceRgb(40, 167, 69)));
        kpis.addCell(kpiCell("Pending", String.valueOf(pending), bold, font, new DeviceRgb(162, 107, 0)));
        kpis.addCell(kpiCell("Suspended", String.valueOf(suspended), bold, font, new DeviceRgb(220, 53, 69)));

        return kpis;
    }

    private Cell kpiCell(String label, String value, PdfFont bold, PdfFont font, DeviceRgb valueColor) {
        Paragraph pLabel = new Paragraph(label)
                .setFont(font).setFontSize(10).setFontColor(GRAY).setMargin(0);

        Paragraph pVal = new Paragraph(value)
                .setFont(bold).setFontSize(22).setFontColor(valueColor).setMargin(0);

        return new Cell()
                .add(pLabel)
                .add(pVal)
                .setPadding(12)
                .setBackgroundColor(LIGHT_BG)
                .setBorder(new SolidBorder(BORDER, 1))
                .setBorderRadius(new BorderRadius(14));
    }

    // Distribution
    private Cell distHeadCell(String t, PdfFont bold) {
        return new Cell()
                .add(new Paragraph(t).setFont(bold).setFontSize(10).setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(RED)
                .setPadding(9)
                .setBorder(Border.NO_BORDER);
    }

    private Cell distLabelCell(String t, PdfFont bold) {
        return new Cell()
                .add(new Paragraph(t).setFont(bold).setFontSize(10).setFontColor(DARK))
                .setPadding(9)
                .setBorderBottom(new SolidBorder(BORDER, 1))
                .setBorderLeft(Border.NO_BORDER).setBorderRight(Border.NO_BORDER).setBorderTop(Border.NO_BORDER);
    }

    private Cell distValueCell(String t, PdfFont bold) {
        return new Cell()
                .add(new Paragraph(t).setFont(bold).setFontSize(10).setFontColor(DARK).setTextAlignment(TextAlignment.RIGHT))
                .setPadding(9)
                .setBorderBottom(new SolidBorder(BORDER, 1))
                .setBorderLeft(Border.NO_BORDER).setBorderRight(Border.NO_BORDER).setBorderTop(Border.NO_BORDER);
    }

    private Cell distBarCell(long val, long max, DeviceRgb color) {
        float percent = (float) val / (float) max;

        // container
        Div track = new Div()
                .setHeight(10)
                .setBackgroundColor(new DeviceRgb(240, 240, 240))
                .setBorderRadius(new BorderRadius(999));

        // bar
        Div fill = new Div()
                .setHeight(10)
                .setWidth(UnitValue.createPercentValue(Math.max(4, (int) Math.round(percent * 100))))
                .setBackgroundColor(color)
                .setBorderRadius(new BorderRadius(999));

        track.add(fill);

        return new Cell()
                .add(track)
                .setPaddingTop(12)
                .setPaddingBottom(12)
                .setBorderBottom(new SolidBorder(BORDER, 1))
                .setBorderLeft(Border.NO_BORDER).setBorderRight(Border.NO_BORDER).setBorderTop(Border.NO_BORDER);
    }

    // Table
    private void addTableHeader(Table t, String text, PdfFont bold) {
        t.addHeaderCell(new Cell()
                .add(new Paragraph(text).setFont(bold).setFontSize(10).setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(RED)
                .setPadding(10)
                .setBorder(Border.NO_BORDER));
    }

    private Cell bodyCell(String txt, PdfFont font, boolean zebra) {
        return new Cell()
                .add(new Paragraph(txt).setFont(font).setFontSize(9.5f).setFontColor(DARK))
                .setBackgroundColor(zebra ? new DeviceRgb(252, 252, 252) : ColorConstants.WHITE)
                .setPadding(9)
                .setBorderBottom(new SolidBorder(BORDER, 1))
                .setBorderLeft(Border.NO_BORDER).setBorderRight(Border.NO_BORDER).setBorderTop(Border.NO_BORDER);
    }

    private Cell statusPillCell(String status, PdfFont bold, boolean zebra) {
        String s = (status == null ? "" : status.toUpperCase());

        DeviceRgb bg;
        DeviceRgb fg;

        if ("APPROVED".equals(s)) {
            bg = new DeviceRgb(235, 248, 239);
            fg = new DeviceRgb(40, 167, 69);
        } else if ("PENDING".equals(s)) {
            bg = new DeviceRgb(255, 248, 230);
            fg = new DeviceRgb(162, 107, 0);
        } else {
            bg = new DeviceRgb(255, 235, 238);
            fg = new DeviceRgb(220, 53, 69);
        }

        Paragraph pill = new Paragraph(s.isBlank() ? "-" : s)
                .setFont(bold).setFontSize(9).setFontColor(fg)
                .setTextAlignment(TextAlignment.CENTER)
                .setMargin(0);

        Cell cell = new Cell()
                .setBackgroundColor(zebra ? new DeviceRgb(252, 252, 252) : ColorConstants.WHITE)
                .setPadding(9)
                .setBorderBottom(new SolidBorder(BORDER, 1))
                .setBorderLeft(Border.NO_BORDER).setBorderRight(Border.NO_BORDER).setBorderTop(Border.NO_BORDER);

        // “pill” inside
        Div wrap = new Div()
                .setBackgroundColor(bg)
                .setBorderRadius(new BorderRadius(999))
                .setPaddingLeft(8).setPaddingRight(8)
                .setPaddingTop(4).setPaddingBottom(4)
                .setTextAlignment(TextAlignment.CENTER);

        wrap.add(pill);
        cell.add(wrap);

        return cell;
    }

    private String safe(String s) {
        return (s == null || s.isBlank()) ? "-" : s;
    }

    // =========================
    // Header/Footer
    // =========================
    private static class PremiumHeaderFooter implements IEventHandler {

        private final String title;
        private final String generatedAt;
        private final PdfFont font;
        private final ImageData logo;

        PremiumHeaderFooter(String title, String generatedAt, PdfFont font) throws Exception {
            this.title = title;
            this.generatedAt = generatedAt;
            this.font = font;

            // charger le logo
            this.logo = ImageDataFactory.create(
                    PartnerPdfExportService.class.getResource("/static/logo.png")
            );
        }

        @Override
        public void handleEvent(Event event) {

            PdfDocumentEvent ev = (PdfDocumentEvent) event;
            PdfDocument pdf = ev.getDocument();
            PdfPage page = ev.getPage();

            Rectangle ps = page.getPageSize();

            PdfCanvas canvas = new PdfCanvas(
                    page.newContentStreamBefore(),
                    page.getResources(),
                    pdf
            );

            int pageNumber = pdf.getPageNumber(page);

            // ======================
            // LOGO
            // ======================
            Image logoImg = new Image(logo);
            logoImg.scaleToFit(80, 40);
            logoImg.setFixedPosition(ps.getLeft() + 36, ps.getTop() - 45);

            new Canvas(canvas, ps).add(logoImg);

            // ======================
            // HEADER LINE
            // ======================
            canvas.saveState();
            canvas.setStrokeColor(new DeviceRgb(235, 235, 235));
            canvas.setLineWidth(1);
            canvas.moveTo(ps.getLeft() + 36, ps.getTop() - 55);
            canvas.lineTo(ps.getRight() - 36, ps.getTop() - 55);
            canvas.stroke();
            canvas.restoreState();

            // ======================
            // HEADER TITLE
            // ======================
            canvas.beginText();
            canvas.setFontAndSize(font, 10);
            canvas.setFillColor(new DeviceRgb(120,120,120));
            canvas.moveText(ps.getLeft() + 120, ps.getTop() - 38);
            canvas.showText(title);
            canvas.endText();

            // ======================
            // HEADER DATE
            // ======================
            canvas.beginText();
            canvas.setFontAndSize(font, 9);
            canvas.setFillColor(new DeviceRgb(150,150,150));
            canvas.moveText(ps.getRight() - 180, ps.getTop() - 38);
            canvas.showText("Generated: " + generatedAt);
            canvas.endText();

            // ======================
            // FOOTER PAGE NUMBER
            // ======================
            canvas.beginText();
            canvas.setFontAndSize(font, 9);
            canvas.setFillColor(new DeviceRgb(150,150,150));
            canvas.moveText(ps.getWidth() / 2 - 30, ps.getBottom() + 20);
            canvas.showText("Page " + pageNumber);
            canvas.endText();
        }
    }

    // =========================
    // Watermark
    // =========================
    private static class WatermarkHandler implements IEventHandler {
        private final String text;
        private final PdfFont font;

        WatermarkHandler(String text, PdfFont font) {
            this.text = text;
            this.font = font;
        }

        @Override
        public void handleEvent(Event event) {
            PdfDocumentEvent ev = (PdfDocumentEvent) event;
            PdfDocument pdf = ev.getDocument();
            PdfPage page = ev.getPage();

            Rectangle ps = page.getPageSize();
            PdfCanvas canvas = new PdfCanvas(page.newContentStreamBefore(), page.getResources(), pdf);

            canvas.saveState();
            PdfExtGState gs = new PdfExtGState().setFillOpacity(0.06f);
            canvas.setExtGState(gs);
            canvas.beginText();
            canvas.setFontAndSize(font, 60);
            canvas.setFillColor(ColorConstants.BLACK);

            // rotate watermark
            double angle = Math.toRadians(35);
            float x = ps.getWidth() / 2;
            float y = ps.getHeight() / 2;
            canvas.setTextMatrix((float) Math.cos(angle), (float) Math.sin(angle),
                    (float) -Math.sin(angle), (float) Math.cos(angle), x - 180, y);

            canvas.showText(text);
            canvas.endText();
            canvas.restoreState();
        }
    }
}