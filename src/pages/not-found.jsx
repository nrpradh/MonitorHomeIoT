import { Link, useNavigate } from "react-router";

export default function NotFound() {
    const navigate = useNavigate()
    const handleGoBack = () => { navigate(-1)}

    return (
        <section
            className="flex flex-col items-center justify-evenly min-h-[90vh]"
            aria-labelledby="not-found-page"
        >
            <header className="flex flex-col items-center">
                <h1 id="404-title" className="leading-normal">404</h1>
                <h2 id="not-found-title" className="leading-none">Page Not FOund</h2>
            </header>
            <nav className="flex space-x-12">
                <button onClick={handleGoBack} className="linkto uppercase">Go Back</button>
                <Link to='/' className="linkto uppercase">Go to home</Link>

            </nav>
            

        </section>
    );
}
