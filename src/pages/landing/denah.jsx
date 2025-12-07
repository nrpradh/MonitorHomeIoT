import Marquee from "react-fast-marquee";
import { GoArrowUpRight } from "react-icons/go";
import { Link } from "react-router";

export default function Rooms() {

    return (
        <section 
            className="flex flex-col  space-y-6 min-h-[85vh]"
            aria-labelledby="hero-title"
        >
            <header className="flex flex-col ">
                <h3 id="hero-title" className="leading-none">
                    Home Monitor
                </h3>

            </header>
            <div className="grid grid-rows-2 gap-2 ">
                <div className="grid grid-cols-8 gap-2">
                    <div className="rooms ">
                        <h4 className=""> Mesin Cuci & Pompa Air</h4>

                    </div>
                    <div className="rooms col-span-2">
                        <h4 className=""> Bedroom</h4>
                    </div>
                    <div className="rooms col-span-2 ">
                        <h4> Kulkas</h4>
                        <h4> Kompor</h4>
                    </div>
                    <div className="rooms col-span-3">4</div>

                </div>
                <div className="grid grid-cols-8 gap-2">
                    <div className="rooms col-span-2 "> 5</div>
                    <div className="rooms col-span-2">6</div>
                    <div className="rooms ">7</div>
                    <div className="rooms col-span-2"></div>
                    <div className="rooms ">
                        <h4> Door</h4>
                    </div>

                </div>
            </div>
        </section>
    );
}
