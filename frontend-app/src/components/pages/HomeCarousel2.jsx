import "./HomeCarousel2.css";
import subbannerimg1 from "../../assets/img/banner.jpg"
import subbannerimg2 from "../../assets/img/banner2.jpg"
import subbannerimg3 from "../../assets/img/banner3.jpg"

export const HomeCarousel2 = () => {
    return (
        <div className='banner2-section'>
            <div className='container-fluid'>
                <div className='sub-banner'>
                    <div className="sub-bannerbox">
                        <img src={subbannerimg1} alt='Sub Banner1' />

                    </div>
                    <div className="sub-bannerbox">
                        <img src={subbannerimg2} alt='Sub Banner2' />

                    </div>
                    <div className="sub-bannerbox">
                        <img src={subbannerimg3} alt='Sub Banner2' />


                    </div>
                </div>
            </div>



        </div>
    )
}
