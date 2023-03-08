import "./tutorial.scss";
import { useState, useEffect } from "react";
import Draggable from 'react-draggable';

export default function Tutorial() {
    const [displayed, setDisplayed] = useState(false)

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDisplayed(true);
        }, 1000)
        return () => {
            clearTimeout(timeoutId)
        };
    }, []);

    return displayed ? (
        <Draggable handle="#handle">
            <section className="tuto_container" id="handle">
                <div className="buttons">
                    <div className="quitButton" onClick={() => setDisplayed(false)}/>
                    <div className="minimizeButton" />
                    <div className="fullscreenButton" />
                </div>
                <div className="content">
                    <h2>Bienvenue !</h2>
                    <p>Vous pouvez utiliser ce site comme vous le feriez naturellement sur votre ordinateur, et pouvez explorer mon univers.</p>
                    <p><b>Pour fermer cette fenêtre, cliquez sur le bouton rouge en haut à gauche !</b></p>
                </div>
            </section>
        </Draggable>
    ) : null
}