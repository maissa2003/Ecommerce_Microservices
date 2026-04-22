package tn.esprit.gestionsession.services.implementations;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Service;
import tn.esprit.gestionsession.entities.PcOffer;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class PcScraperService {

    public List<PcOffer> scrapeSite() {

        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--disable-gpu");
        options.addArguments("--window-size=1920,1080");
        options.addArguments("--remote-allow-origins=*");
        options.addArguments("--disable-blink-features=AutomationControlled");
        options.addArguments("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

        WebDriver driver = new ChromeDriver(options);
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));

        List<PcOffer> offers = new ArrayList<>();

        try {

            for (int page = 1; page <= 3; page++) {

                String url = "https://www.tunisianet.com.tn/301-pc-portable-tunisie";
                if (page > 1) {
                    url += "?page=" + page + "&order=product.price.asc";
                }

                driver.get(url);

                // Wait for products to load instead of Thread.sleep
                try {
                    WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
                    wait.until(ExpectedConditions.presenceOfElementLocated(
                            By.cssSelector(".thumbnail-container")
                    ));
                } catch (TimeoutException e) {
                    System.out.println("Timeout waiting for page " + page + ", skipping...");
                    continue;
                }

                List<WebElement> products = driver.findElements(By.cssSelector(".thumbnail-container"));
                System.out.println("Page " + page + ": found " + products.size() + " products");

                for (int i = 0; i < Math.min(products.size(), 10); i++) {

                    WebElement product = products.get(i);

                    try {

                        // NAME
                        String name = "";
                        List<WebElement> nameElements = product.findElements(By.cssSelector(".product-title a"));
                        if (!nameElements.isEmpty()) {
                            name = nameElements.get(0).getText().trim();
                        }
                        if (name.isEmpty()) continue;

                        // DESCRIPTION (SPECS)
                        String description = "";
                        List<WebElement> descList = product.findElements(By.cssSelector(".listds"));
                        if (!descList.isEmpty()) {
                            description = descList.get(0).getText();
                        }

                        // PRICE — try multiple selectors
                        double price = 0;

                        List<WebElement> priceElements = product.findElements(
                                By.cssSelector(".wb-action-block .product-price-and-shipping span.price")
                        );

                        if (priceElements.isEmpty()) {
                            priceElements = product.findElements(By.cssSelector("span.price"));
                        }

                        if (!priceElements.isEmpty()) {
                            String priceText = priceElements.get(0).getText();
                            if (priceText != null && !priceText.isEmpty()) {
                                String cleaned = priceText.replaceAll("[^0-9]", "");
                                if (!cleaned.isEmpty()) {
                                    price = Double.parseDouble(cleaned) / 1000.0;
                                }
                            }
                        }

                        // EXTRACT SPECS from name + description combined
                        String fullText = name + " " + description;
                        Integer ram = extractRam(fullText);
                        String cpu = extractCpu(fullText);
                        String gpu = extractGpu(fullText);

                        offers.add(new PcOffer(
                                name,
                                cpu,
                                gpu,
                                ram,
                                price,
                                "Tunisianet"
                        ));

                    } catch (StaleElementReferenceException e) {
                        System.out.println("Stale element on page " + page + ", item " + i + ", skipping");
                    } catch (Exception e) {
                        System.out.println("Error parsing product on page " + page + ": " + e.getMessage());
                    }
                }
            }

        } catch (Exception e) {
            System.err.println("Fatal scraping error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Scraping failed: " + e.getMessage(), e);
        } finally {
            driver.quit();
        }

        System.out.println("Total offers scraped: " + offers.size());
        return offers;
    }

    private Integer extractRam(String text) {
        if (text == null) return null;
        if (text.contains("32 Go") || text.contains("32Go") || text.contains("32GB")) return 32;
        if (text.contains("16 Go") || text.contains("16Go") || text.contains("16GB")) return 16;
        if (text.contains("8 Go")  || text.contains("8Go")  || text.contains("8GB"))  return 8;
        if (text.contains("4 Go")  || text.contains("4Go")  || text.contains("4GB"))  return 4;
        return null;
    }

    private String extractCpu(String text) {
        if (text == null) return null;
        if (text.contains("Core i9") || text.contains("i9")) return "Intel Core i9";
        if (text.contains("Core i7") || text.contains("i7")) return "Intel Core i7";
        if (text.contains("Core i5") || text.contains("i5")) return "Intel Core i5";
        if (text.contains("Core i3") || text.contains("i3")) return "Intel Core i3";
        if (text.contains("Ryzen 9")) return "AMD Ryzen 9";
        if (text.contains("Ryzen 7")) return "AMD Ryzen 7";
        if (text.contains("Ryzen 5")) return "AMD Ryzen 5";
        if (text.contains("Ryzen 3")) return "AMD Ryzen 3";
        if (text.contains("Intel"))   return "Intel";
        if (text.contains("Ryzen"))   return "AMD Ryzen";
        if (text.contains("Celeron")) return "Intel Celeron";
        if (text.contains("Pentium")) return "Intel Pentium";
        return null;
    }

    private String extractGpu(String text) {
        if (text == null) return null;
        if (text.contains("RTX 4090")) return "NVIDIA RTX 4090";
        if (text.contains("RTX 4080")) return "NVIDIA RTX 4080";
        if (text.contains("RTX 4070")) return "NVIDIA RTX 4070";
        if (text.contains("RTX 4060")) return "NVIDIA RTX 4060";
        if (text.contains("RTX 3080")) return "NVIDIA RTX 3080";
        if (text.contains("RTX 3070")) return "NVIDIA RTX 3070";
        if (text.contains("RTX 3060")) return "NVIDIA RTX 3060";
        if (text.contains("RTX"))      return "NVIDIA RTX";
        if (text.contains("GTX 1650")) return "NVIDIA GTX 1650";
        if (text.contains("GTX"))      return "NVIDIA GTX";
        if (text.contains("MX550"))    return "NVIDIA MX550";
        if (text.contains("MX"))       return "NVIDIA MX";
        if (text.contains("Radeon"))   return "AMD Radeon";
        if (text.contains("Iris Xe"))  return "Intel Iris Xe";
        if (text.contains("UHD"))      return "Intel UHD";
        return null;
    }
}