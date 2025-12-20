import { useEffect, useState } from "react";
import { Link } from "react-router";


export const Welcome = () => {
    const [a, setA] = useState(Math.floor(Math.random() * 10));
    const [b, setB] = useState(Math.floor(Math.random() * 10));
    const [result, setResult] = useState<number>(0);

    useEffect(() => {
        fetch("/api/add", {
            method: "POST",
            body: JSON.stringify({ a, b }),
        }).then(res => res.json()).then((data: { result: number }) => setResult(data.result));
    }, [a, b])

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 flex flex-col items-center justify-center p-6">
            <div className="text-center max-w-3xl mx-auto">
                {/* Pig emoji - centered and prominent */}
                <div className="text-8xl mb-6 transform transition-all duration-500 hover:scale-110">
                    🐷
                </div>
                
                {/* Main heading - clean and centered */}
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                    Welcome to create with <span className="text-yellow-300">Wildpig</span>.
                </h1>
                
                {/* Subtitle -简洁说明 */}
                <p className="text-lg md:text-xl text-purple-100 mb-4 max-w-4xl mx-auto leading-relaxed">
                    An easy framework for building amazing <span className="font-bold">Fullstack Web Applications</span>.
                </p>

                {/* Subtitle -简洁说明 */}
                <p className="text-lg md:text-xl text-purple-100 mb-8 max-w-4xl mx-auto leading-relaxed">
                    All built in <span className="font-bold">Typescript</span> by <span className="font-bold">Bun</span>.
                </p>
                
                {/* Feature tags */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    <span className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-full">SSR</span>
                    <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">Hot Reload</span>
                    <span className="px-3 py-1 bg-cyan-500 text-white text-sm font-medium rounded-full">React</span>
                    <span className="px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-full">Bun</span>
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">Typescript</span>
                    <span className="px-3 py-1 bg-teal-500 text-white text-sm font-medium rounded-full">TailwindCSS</span>
                </div>
                
                {/* Buttons -简洁设计 */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a 
                        href="https://www.npmjs.com/package/wildpig" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-4 bg-white text-purple-800 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl"
                    >
                        View on NPM
                    </a>
                    <a 
                        href="https://github.com/Eriktse/wildpig" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg shadow-lg hover:bg-white hover:text-purple-800 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl"
                    >
                        View on GitHub
                    </a>
                </div>

                <div className="mt-4 text-white">
                    Test client request("/api/add"):
                    <input value={a} onChange={e => setA(Number(e.target.value))} className="m-2 w-[50px] border border-white px-2 py-1 rounded-md"/>
                    + <input value={b} onChange={e => setB(Number(e.target.value))} className="m-2 w-[50px] border border-white px-2 py-1 rounded-md"/>
                    = <span className="text-yellow-300">{result}</span>
                </div>

                <div className="mt-4 text-gray-300 cursor-pointer">
                    <Link to="/404">→ Go to the 404 test page.</Link>
                </div>
            </div>
        </div>
    );
};