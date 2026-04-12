package tn.esprit.ms_order.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.ms_order.entities.Country;
import tn.esprit.ms_order.repositories.CountryRepository;

import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CountryService {

    private final CountryRepository countryRepository;

    /**
     * Initialize countries data on startup
     */
    // @PostConstruct - Temporarily disabled for testing
    public void initializeCountries() {
        log.info("🌍 Checking countries data...");

        List<Country> countries = Arrays.asList(
                    // Africa
                    new Country("+216", "Tunisia", "🇹🇳", "TN", "Africa"),
                    new Country("+20", "Egypt", "🇪🇬", "EG", "Africa"),
                    new Country("+212", "Morocco", "🇲🇦", "MA", "Africa"),
                    new Country("+213", "Algeria", "🇩🇿", "DZ", "Africa"),
                    new Country("+234", "Nigeria", "🇳🇬", "NG", "Africa"),
                    new Country("+27", "South Africa", "🇿🇦", "ZA", "Africa"),
                    new Country("+254", "Kenya", "🇰🇪", "KE", "Africa"),
                    new Country("+255", "Tanzania", "🇹🇿", "TZ", "Africa"),
                    new Country("+256", "Uganda", "🇺🇬", "UG", "Africa"),
                    new Country("+251", "Ethiopia", "🇪🇹", "ET", "Africa"),
                    new Country("+243", "DR Congo", "🇨🇩", "CD", "Africa"),
                    new Country("+244", "Angola", "🇦🇴", "AO", "Africa"),
                    new Country("+245", "Guinea", "🇬🇳", "GN", "Africa"),
                    new Country("+249", "Sudan", "🇸🇩", "SD", "Africa"),
                    new Country("+250", "Rwanda", "🇷🇼", "RW", "Africa"),
                    new Country("+257", "Burundi", "🇧🇮", "BI", "Africa"),
                    new Country("+258", "Mozambique", "🇲🇿", "MZ", "Africa"),
                    new Country("+260", "Zambia", "🇿🇲", "ZM", "Africa"),
                    new Country("+261", "Madagascar", "🇲🇬", "MG", "Africa"),
                    new Country("+263", "Zimbabwe", "🇿🇼", "ZW", "Africa"),
                    new Country("+265", "Malawi", "🇲🇼", "MW", "Africa"),
                    new Country("+266", "Lesotho", "🇱🇸", "LS", "Africa"),
                    new Country("+267", "Botswana", "🇧🇼", "BW", "Africa"),
                    new Country("+268", "Eswatini", "🇸🇿", "SZ", "Africa"),
                    new Country("+269", "Comoros", "🇰🇲", "KM", "Africa"),
                    new Country("+290", "Saint Helena", "🇸🇭", "SH", "Africa"),
                    new Country("+291", "Eritrea", "🇪🇷", "ER", "Africa"),
                    new Country("+297", "Aruba", "🇦🇼", "AW", "Caribbean"),

                    // Europe
                    new Country("+33", "France", "🇫🇷", "FR", "Europe"),
                    new Country("+49", "Germany", "🇩🇪", "DE", "Europe"),
                    new Country("+39", "Italy", "🇮🇹", "IT", "Europe"),
                    new Country("+34", "Spain", "🇪🇸", "ES", "Europe"),
                    new Country("+44", "United Kingdom", "🇬🇧", "GB", "Europe"),
                    new Country("+31", "Netherlands", "🇳🇱", "NL", "Europe"),
                    new Country("+32", "Belgium", "🇧🇪", "BE", "Europe"),
                    new Country("+41", "Switzerland", "🇨🇭", "CH", "Europe"),
                    new Country("+43", "Austria", "🇦🇹", "AT", "Europe"),
                    new Country("+45", "Denmark", "🇩🇰", "DK", "Europe"),
                    new Country("+46", "Sweden", "🇸🇪", "SE", "Europe"),
                    new Country("+47", "Norway", "🇳🇴", "NO", "Europe"),
                    new Country("+48", "Poland", "🇵🇱", "PL", "Europe"),
                    new Country("+351", "Portugal", "🇵🇹", "PT", "Europe"),
                    new Country("+352", "Luxembourg", "🇱🇺", "LU", "Europe"),
                    new Country("+353", "Ireland", "🇮🇪", "IE", "Europe"),
                    new Country("+354", "Iceland", "🇮🇸", "IS", "Europe"),
                    new Country("+355", "Albania", "🇦🇱", "AL", "Europe"),
                    new Country("+356", "Malta", "🇲🇹", "MT", "Europe"),
                    new Country("+357", "Cyprus", "🇨🇾", "CY", "Europe"),
                    new Country("+358", "Finland", "🇫🇮", "FI", "Europe"),
                    new Country("+359", "Bulgaria", "🇧🇬", "BG", "Europe"),
                    new Country("+370", "Lithuania", "🇱🇹", "LT", "Europe"),
                    new Country("+371", "Latvia", "🇱🇻", "LV", "Europe"),
                    new Country("+372", "Estonia", "🇪🇪", "EE", "Europe"),
                    new Country("+373", "Moldova", "🇲🇩", "MD", "Europe"),
                    new Country("+374", "Armenia", "🇦🇲", "AM", "Europe"),
                    new Country("+375", "Belarus", "🇧🇾", "BY", "Europe"),
                    new Country("+376", "Andorra", "🇦🇩", "AD", "Europe"),
                    new Country("+377", "Monaco", "🇲🇨", "MC", "Europe"),
                    new Country("+378", "San Marino", "🇸🇲", "SM", "Europe"),
                    new Country("+380", "Ukraine", "🇺🇦", "UA", "Europe"),
                    new Country("+381", "Serbia", "🇷🇸", "RS", "Europe"),
                    new Country("+382", "Montenegro", "🇲🇪", "ME", "Europe"),
                    new Country("+383", "Kosovo", "🇽🇰", "XK", "Europe"),
                    new Country("+385", "Croatia", "🇭🇷", "HR", "Europe"),
                    new Country("+386", "Slovenia", "🇸🇮", "SI", "Europe"),
                    new Country("+387", "Bosnia and Herzegovina", "🇧🇦", "BA", "Europe"),
                    new Country("+389", "North Macedonia", "🇲🇰", "MK", "Europe"),
                    new Country("+420", "Czech Republic", "🇨🇿", "CZ", "Europe"),
                    new Country("+421", "Slovakia", "🇸🇰", "SK", "Europe"),
                    new Country("+423", "Liechtenstein", "🇱🇮", "LI", "Europe"),

                    // North America
                    new Country("+1", "United States", "🇺🇸", "US", "North America"),
                    new Country("+1", "Canada", "🇨🇦", "CA", "North America"),
                    new Country("+52", "Mexico", "🇲🇽", "MX", "North America"),
                    new Country("+501", "Belize", "🇧🇿", "BZ", "North America"),
                    new Country("+502", "Guatemala", "🇬🇹", "GT", "North America"),
                    new Country("+503", "El Salvador", "🇸🇻", "SV", "North America"),
                    new Country("+504", "Honduras", "🇭🇳", "HN", "North America"),
                    new Country("+505", "Nicaragua", "🇳🇮", "NI", "North America"),
                    new Country("+506", "Costa Rica", "🇨🇷", "CR", "North America"),
                    new Country("+507", "Panama", "🇵🇦", "PA", "North America"),

                    // South America
                    new Country("+54", "Argentina", "🇦🇷", "AR", "South America"),
                    new Country("+55", "Brazil", "🇧🇷", "BR", "South America"),
                    new Country("+56", "Chile", "🇨🇱", "CL", "South America"),
                    new Country("+57", "Colombia", "🇨🇴", "CO", "South America"),
                    new Country("+58", "Venezuela", "🇻🇪", "VE", "South America"),
                    new Country("+591", "Bolivia", "🇧🇴", "BO", "South America"),
                    new Country("+592", "Guyana", "🇬🇾", "GY", "South America"),
                    new Country("+593", "Ecuador", "🇪🇨", "EC", "South America"),
                    new Country("+594", "French Guiana", "🇬🇫", "GF", "South America"),
                    new Country("+595", "Paraguay", "🇵🇾", "PY", "South America"),
                    new Country("+597", "Suriname", "🇸🇷", "SR", "South America"),
                    new Country("+598", "Uruguay", "🇺🇾", "UY", "South America"),
                    new Country("+51", "Peru", "🇵🇪", "PE", "South America"),

                    // Middle East
                    new Country("+966", "Saudi Arabia", "🇸🇦", "SA", "Middle East"),
                    new Country("+971", "United Arab Emirates", "🇦🇪", "AE", "Middle East"),
                    new Country("+972", "Israel", "🇮🇱", "IL", "Middle East"),
                    new Country("+973", "Bahrain", "🇧🇭", "BH", "Middle East"),
                    new Country("+974", "Qatar", "🇶🇦", "QA", "Middle East"),
                    new Country("+975", "Bhutan", "🇧🇹", "BT", "Asia"),
                    new Country("+976", "Mongolia", "🇲🇳", "MN", "Asia"),
                    new Country("+977", "Nepal", "🇳🇵", "NP", "Asia"),
                    new Country("+98", "Iran", "🇮🇷", "IR", "Middle East"),
                    new Country("+962", "Jordan", "🇯🇴", "JO", "Middle East"),
                    new Country("+963", "Syria", "🇸🇾", "SY", "Middle East"),
                    new Country("+964", "Iraq", "🇮🇶", "IQ", "Middle East"),
                    new Country("+965", "Kuwait", "🇰🇼", "KW", "Middle East"),
                    new Country("+968", "Oman", "🇴🇲", "OM", "Middle East"),
                    new Country("+970", "Palestine", "🇵🇸", "PS", "Middle East"),
                    new Country("+961", "Lebanon", "🇱🇧", "LB", "Middle East"),
                    new Country("+967", "Yemen", "🇾🇪", "YE", "Middle East"),
                    new Country("+992", "Tajikistan", "🇹🇯", "TJ", "Asia"),
                    new Country("+993", "Turkmenistan", "🇹🇲", "TM", "Asia"),
                    new Country("+994", "Azerbaijan", "🇦🇿", "AZ", "Asia"),
                    new Country("+995", "Georgia", "🇬🇪", "GE", "Asia"),
                    new Country("+996", "Kyrgyzstan", "🇰🇬", "KG", "Asia"),
                    new Country("+997", "Kazakhstan", "🇰🇿", "KZ", "Asia"),
                    new Country("+998", "Uzbekistan", "🇺🇿", "UZ", "Asia"),

                    // Asia
                    new Country("+86", "China", "🇨🇳", "CN", "Asia"),
                    new Country("+91", "India", "🇮🇳", "IN", "Asia"),
                    new Country("+81", "Japan", "🇯🇵", "JP", "Asia"),
                    new Country("+82", "South Korea", "🇰🇷", "KR", "Asia"),
                    new Country("+84", "Vietnam", "🇻🇳", "VN", "Asia"),
                    new Country("+62", "Indonesia", "🇮🇩", "ID", "Asia"),
                    new Country("+63", "Philippines", "🇵🇭", "PH", "Asia"),
                    new Country("+60", "Malaysia", "🇲🇾", "MY", "Asia"),
                    new Country("+65", "Singapore", "🇸🇬", "SG", "Asia"),
                    new Country("+66", "Thailand", "🇹🇭", "TH", "Asia"),
                    new Country("+95", "Myanmar", "🇲🇲", "MM", "Asia"),
                    new Country("+880", "Bangladesh", "🇧🇩", "BD", "Asia"),
                    new Country("+92", "Pakistan", "🇵🇰", "PK", "Asia"),
                    new Country("+94", "Sri Lanka", "🇱🇰", "LK", "Asia"),
                    new Country("+961", "Lebanon", "🇱🇧", "LB", "Middle East"),
                    new Country("+90", "Turkey", "🇹🇷", "TR", "Asia"),
                    new Country("+7", "Russia", "🇷🇺", "RU", "Europe"),
                    new Country("+93", "Afghanistan", "🇦🇫", "AF", "Asia"),

                    // Oceania
                    new Country("+61", "Australia", "🇦🇺", "AU", "Oceania"),
                    new Country("+64", "New Zealand", "🇳🇿", "NZ", "Oceania"),
                    new Country("+675", "Papua New Guinea", "🇵🇬", "PG", "Oceania"),
                    new Country("+676", "Tonga", "🇹🇴", "TO", "Oceania"),
                    new Country("+677", "Solomon Islands", "🇸🇧", "SB", "Oceania"),
                    new Country("+678", "Vanuatu", "🇻🇺", "VU", "Oceania"),
                    new Country("+679", "Fiji", "🇫🇯", "FJ", "Oceania"),
                    new Country("+680", "Palau", "🇵🇼", "PW", "Oceania"),
                    new Country("+681", "Wallis and Futuna", "🇼🇫", "WF", "Oceania"),
                    new Country("+682", "Cook Islands", "🇨🇰", "CK", "Oceania"),
                    new Country("+683", "Niue", "🇳🇺", "NU", "Oceania"),
                    new Country("+684", "Samoa", "🇼🇸", "WS", "Oceania"),
                    new Country("+685", "Samoa", "🇼🇸", "WS", "Oceania"),
                    new Country("+686", "Kiribati", "🇰🇮", "KI", "Oceania"),
                    new Country("+687", "New Caledonia", "🇳🇨", "NC", "Oceania"),
                    new Country("+688", "Tuvalu", "🇹🇻", "TV", "Oceania"),
                    new Country("+689", "French Polynesia", "🇵🇫", "PF", "Oceania"),

                    // Caribbean
                    new Country("+1", "Puerto Rico", "🇵🇷", "PR", "Caribbean"),
                    new Country("+1", "Jamaica", "🇯🇲", "JM", "Caribbean"),
                    new Country("+1", "Trinidad and Tobago", "🇹🇹", "TT", "Caribbean"),
                    new Country("+1", "Barbados", "🇧🇧", "BB", "Caribbean"),
                    new Country("+1", "Bahamas", "🇧🇸", "BS", "Caribbean"),
                    new Country("+1", "Dominican Republic", "🇩🇴", "DO", "Caribbean"),
                    new Country("+1", "Haiti", "🇭🇹", "HT", "Caribbean"),
                    new Country("+1", "Cuba", "🇨🇺", "CU", "Caribbean"),
                    new Country("+1", "Dominica", "🇩🇲", "DM", "Caribbean"),
                    new Country("+1", "Saint Lucia", "🇱🇨", "LC", "Caribbean"),
                    new Country("+1", "Saint Vincent", "🇻🇨", "VC", "Caribbean"),
                    new Country("+1", "Grenada", "🇬🇩", "GD", "Caribbean"),
                    new Country("+1", "Antigua and Barbuda", "🇦🇬", "AG", "Caribbean"),
                    new Country("+1", "Saint Kitts and Nevis", "🇰🇳", "KN", "Caribbean"),
                    new Country("+1", "Montserrat", "🇲🇸", "MS", "Caribbean"),
                    new Country("+1", "Anguilla", "🇦🇮", "AI", "Caribbean"),
                    new Country("+1", "British Virgin Islands", "🇻🇬", "VG", "Caribbean"),
                    new Country("+1", "US Virgin Islands", "🇻🇮", "VI", "Caribbean"),
                    new Country("+1", "Turks and Caicos", "🇹🇨", "TC", "Caribbean"),
                    new Country("+1", "Cayman Islands", "🇰🇾", "KY", "Caribbean"),
                    new Country("+599", "Curaçao", "🇨🇼", "CW", "Caribbean"),
                    new Country("+599", "Bonaire", "🇧🇶", "BQ", "Caribbean"),

                    // South Asia
                    new Country("+960", "Maldives", "🇲🇻", "MV", "Asia"),
                    new Country("+977", "Nepal", "🇳🇵", "NP", "Asia")
            );

            // Filter out countries that already exist (by ISO code)
            List<Country> newCountries = countries.stream()
                    .filter(c -> !countryRepository.existsByIsoCode(c.getIsoCode()))
                    .toList();

            if (!newCountries.isEmpty()) {
                countryRepository.saveAll(newCountries);
                log.info("✅ Initialized {} new countries", newCountries.size());
            } else {
                log.info("🌍 All countries already initialized");
            }
    }

    public List<Country> getAllCountries() {
        return countryRepository.findAll();
    }

    public List<Country> getActiveCountries() {
        return countryRepository.findByActiveTrue();
    }

    public Country getCountryById(Long id) {
        return countryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Country not found with id: " + id));
    }

    public Country getCountryByCode(String code) {
        return countryRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Country not found with code: " + code));
    }

    public Country saveCountry(Country country) {
        return countryRepository.save(country);
    }

    public void deleteCountry(Long id) {
        countryRepository.deleteById(id);
    }

    public Country toggleCountryStatus(Long id) {
        Country country = getCountryById(id);
        country.setActive(!country.getActive());
        return countryRepository.save(country);
    }

    public List<Country> getCountriesByRegion(String region) {
        return countryRepository.findByRegion(region);
    }
}
