import "./toolbar.scss";

export default function Toolbar() {
    const current = new Date();
    const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`;

    return (
        <section className="toolbar">
            <div className="menus">
                <p>❤</p>
                <a href="#perso"><p>Milo</p></a>
                <a href="#stack"><p>Stack</p></a>
                <a href="#pro"><p>Pro</p></a>
                <a href="#education"><p>Education</p></a>
            </div>
            <div className="icons">
                <p>{date}</p>
                <p>9:41 am</p>
            </div>
        </section>
    )
}