import AboutMe from './components/aboutme/AboutMe.jsx';
import Advantages from './components/advantages/Advantages.jsx';
import Footer from './components/footer/Footer.jsx';
import Navbar from './components/navbar/Navbar.jsx';
import OfferedServices from './components/offered-services/OfferedServices.jsx';
import HotOffers from './components/hot-offers/HotOffers.jsx';
import Preview from './components/preview/Preview.jsx';
import Reviews from './components/reviews/Reviews.jsx';
import PriceList from './components/price-list/PriceList.jsx';

function App() {
    return (
        <div className="h-full max-w-full">
            <Navbar />
            <div id="portfolio">
                <Preview />
            </div>
            <div id="offered-services">
                <OfferedServices />
                <Advantages />
            </div>
            <div id="price-list">
              <PriceList/>
            </div>
            <HotOffers />
            <div id="about-me">
                <AboutMe />
            </div>
            <div id="reviews">
                <Reviews />
            </div>
            <Footer />
        </div>
    );
}

export default App;
