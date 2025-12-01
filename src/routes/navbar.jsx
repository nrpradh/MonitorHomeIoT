import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";

export default function Navbar() {
    const [navOpen, setNavOpen] = useState(false);
    const [scrollDirection, setScrollDirection] = useState("up");
    const lastScrollY = useRef(0);

    const links = [
        { to: "/about", label: "About" },
        { to: "/works", label: "Works" },
        { to: "#contact", label: "Contact", isAnchor: true },
    ];

    const toggleNav = () => setNavOpen(!navOpen);

    const handleNavigate = (e) => {
        if (e.target.tagName === "A") {
        setNavOpen(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleOutsideClick = (e) => {
        if (!e.target.closest(".nav-container") && !e.target.closest(".menu-icon")) {
        setNavOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY.current) setScrollDirection("down");
        else setScrollDirection("up");
        lastScrollY.current = currentScrollY;
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 w-full z-20 py-4 md:px-12 px-6 transition-transform duration-500 ${
            scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
        }`}
        >
        <div className="flex justify-between items-center mix-blend-difference ">
            <Link to="/">
            <img
                src="https://dummyimage.com/606x606"
                alt="Logo"
                className="size-16  w-auto object-contaiJn mix-blend-difference "
            />
            </Link>

            <nav className="hidden md:flex space-x-12 uppercase  mix-blend-difference">
            {links.map((link, i) =>
                link.isAnchor ? (
                <a
                    key={i}
                    href={link.to}
                    className="linkto"
                >
                    {link.label}
                </a>
                ) : (
                <Link
                    key={i}
                    to={link.to}
                    className="linkto"
                >
                    {link.label}
                </Link>
                )
            )}
            </nav>

            <div className="md:hidden menu-icon" onClick={toggleNav}>
            {navOpen ? (
                <AiOutlineClose className="text-4xl hover:text-orange-500 cursor-pointer" />
            ) : (
                <AiOutlineMenu className="text-2xl cursor-pointer" />
            )}
            </div>
        </div>

        <div
            className={`nav-container fixed top-0 left-0 w-[70%] h-full bg-black bg-opacity-85 glassmorphism border-r-2 border-white transform transition-transform duration-300 md:hidden ${
            navOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
            <div
            className="flex flex-col pt-16 space-y-6 text-2xl uppercase text-white mix-blend-difference"
            onClick={handleNavigate}
            >
            {links.map((link, i) =>
                link.isAnchor ? (
                <a
                    key={i}
                    href={link.to}
                    className="px-6 py-2 hover:brightness-110"
                >
                    {link.label}
                </a>
                ) : (
                <Link
                    key={i}
                    to={link.to}
                    className="px-6 py-2 hover:brightness-110"
                >
                    {link.label}
                </Link>
                )
            )}
            </div>
        </div>
        </header>
    );
}
