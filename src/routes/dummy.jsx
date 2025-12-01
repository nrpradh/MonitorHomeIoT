import allWorks from "../../data/AllWorks.json";
import { useParams } from "react-router";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);


export default function WorkDetail() {
    const overviewRef = useRef(null);
    const leftRef = useRef(null);
    const { slug } = useParams();

    const work = allWorks.find((item) => item.slug === slug);

    if (!work) return <div className="py-20 text-center text-6xl font-antonio-regular uppercase">Project not found.</div>;

    const { overview,category, underthehood, snapshots = [],  } = work;
    useEffect(() => {
    if (!overviewRef.current || !leftRef.current) return;

    const ctx = gsap.context(() => {
        ScrollTrigger.create({
        trigger: overviewRef.current,
        start: "top top", // when the section reaches the top
        end: "bottom bottom", // until the end of the section
        pin: leftRef.current, // pin the left column
        pinSpacing: false, // remove extra spacing if you want
        scrub: true, // smooth scroll effect
        });
    }, overviewRef);

    return () => ctx.revert();
    }, []);
    return (
        <section className="pt-20 space-y-12">
            {/* Title + Description */}
            <header className="space-y-4">
                <h2 >{overview.title}</h2>
                <p className="text-lg text-gray-600 max-w-2xl">{overview.description}</p>
            </header>

            <section>
                <div className="grid md:grid-cols-4 gap-6">
                    <CategoryBlock title="Service" items={category.Service} />
                    <CategoryBlock title="Platform" items={category.Platform} />
                    <CategoryBlock title="Scope" items={category.scope} />
                    <CategoryBlock title="Output" items={category.output} />
                </div>
            </section>

            {snapshots.length > 0 && (
                <div className="flex w-full gap-4">
                    {snapshots.slice(0, 2).map((src, index) => (
                        <img
                            key={index}
                            src={src}
                            alt={`${overview.title} cover ${index + 1}`}
                            className="flex-1 h-96 rounded object-cover"
                        />
                    ))}
                </div>
            )}

            {/* Overview Section */}
            <section className="grid md:grid-cols-2" ref={overviewRef}>
                <div className="flex flex-col justify-center" ref={leftRef}>
                    <h2>Overview</h2>
                </div>
                <div className=" max-w-xl space-y-8">
                    <DetailBlock title="Purpose" items={overview.purpose} />
                    <DetailBlock title="Problem" items={overview.problem} />
                    <DetailBlock title="Solution" items={overview.solution} />
                    {overview.vision && (
                        <DetailBlock title="Vision" items={overview.vision} />
                    )}
                </div>
            </section>
            {/* {snapshots.length > 0 && (
                <div className="flex w-full gap-4">
                    {snapshots.slice(2,5).map((src, index) => (
                        <img
                            key={index}
                            src={src}
                            alt={`${overview.title} cover ${index + 1}`}
                            className="flex-1 h-96 rounded object-cover overflow-x-hidden"
                        />
                    ))}
                </div>
            )} */}

            {/* Under The Hood */}
            {/* <section className="space-y-6">
                <h2 className="text-2xl font-semibold">Under the Hood</h2>

                {underthehood.background && (
                    <p className="text-gray-700">{underthehood.background}</p>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    <DetailBlock title="My Role" items={underthehood.myrole} />
                    <DetailBlock title="Tools" items={underthehood.tools} />
                </div>

                {Array.isArray(underthehood.creditto) &&
                    underthehood.creditto.length > 0 &&
                    underthehood.creditto[0] !== "null" && (
                        <div>
                            <h3 className="font-semibold text-xl mb-2">Credits</h3>
                            <ul className="space-y-2 list-disc ml-6">
                                {underthehood.creditto.map((person, index) => (
                                    <li key={index}>
                                        {person.name}
                                        {person.github && (
                                            <a
                                                href={person.github}
                                                target="_blank"
                                                className="text-blue-600 ml-2"
                                            >
                                                GitHub
                                            </a>
                                        )}
                                        {person.linkedin && (
                                            <a
                                                href={person.linkedin}
                                                target="_blank"
                                                className="text-blue-600 ml-2"
                                            >
                                                LinkedIn
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
            </section> */}

            {/* Snapshots */}
            {/* <section className="space-y-6">
                <h2 className="text-2xl font-semibold">Snapshots</h2>
                <div className="space-y-8">
                    {snapshots.map((shot, index) => (
                        <img
                            key={index}
                            src={shot}
                            alt={`Snapshot ${index + 1}`}
                            className="w-full rounded-xl shadow"
                        />
                    ))}
                </div>
            </section> */}
        </section>
    );
}

function DetailBlock({ title, items }) {
    if (!items || !items.length) return null;

    return (
        <div className="space-y-2">
            <h4>{title}</h4>
            <div className="space-y-1 text-gray-700">
                {items.map((item, i) => (
                    <p key={i}>{item}</p>
                ))}
            </div>
        </div>
    );
}

function CategoryBlock({ title, items }) {
    if (!items || !items.length) return null;

    return (
        <div className="space-y-2">
            <h4 className="">{title}</h4>
            <div className="space-y-1 text-gray-700">
                {items.map((item, i) => (
                    <p key={i}>{item}</p>
                ))}
            </div>
        </div>
    );
}
