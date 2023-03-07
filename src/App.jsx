import "./App.scss";
import version from "./../package.json";

export default function App() {
  return (
    <div className="App">
      <div className="toolbar">
        <div className="buttons">
          <div className="quitButton" />
          <div className="minimizeButton" />
          <div className="fullscreenButton" />
        </div>
        <p className="versionNumber">v{version.version}</p>
      </div>
      <div className="page">
        <div className="content">
          <h3>
            {" "}
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
            congue, nunc vel varius porttitor, dui augue faucibus augue, ut
            fermentum lectus tellus sit amet erat. Pellentesque ut ante nec
            turpis vestibulum faucibus. Nullam enim dolor, lobortis suscipit
            elit ac, egestas ullamcorper est. Cras suscipit fringilla rutrum.
            Nulla eu tortor pellentesque, egestas turpis eget, ultricies justo.
            Duis sit amet nisl consectetur, iaculis quam nec, accumsan ante.
            Nullam at dapibus mauris. Aenean aliquam at felis nec vulputate. Sed
            hendrerit, ligula eu fringilla commodo, massa odio elementum turpis,
            tristique eleifend sapien dui quis tortor. Nullam aliquam interdum
            lacus, in aliquet justo venenatis sed. Donec faucibus massa vel
            lacus feugiat congue. In vestibulum porttitor felis, ac sagittis
            ante aliquet at. Nullam euismod lacus lorem, eget varius arcu semper
            nec. Sed id purus non libero lobortis efficitur. Aliquam suscipit
            ipsum eget felis iaculis pellentesque. Duis molestie rhoncus
            imperdiet. Donec bibendum justo neque, vel vehicula urna luctus sit
            amet. Nunc lectus justo, maximus ac pulvinar vitae, scelerisque
            maximus arcu. Donec semper vestibulum enim, quis faucibus mauris
            tristique quis. Ut ut nulla quam. Fusce ultricies sit amet erat
            interdum ornare. Nullam ullamcorper ipsum lorem, sit amet finibus
            est dictum id. Sed faucibus scelerisque ante, sed laoreet felis
            commodo et. Nam turpis sapien, imperdiet non luctus eu, mattis vitae
            lacus. Vivamus rhoncus congue metus vel facilisis. Donec
            pellentesque, ligula consequat egestas dictum, elit mi aliquam
            risus, ac mollis magna erat sit amet nisi. Quisque in risus ornare,
            volutpat nunc vel, eleifend lectus. Mauris dictum placerat
            consectetur. Suspendisse auctor, diam vel feugiat condimentum, lacus
            mi vulputate sapien, at euismod lorem risus non tellus. Maecenas
            vestibulum nunc dui, dignissim consequat leo fermentum id. Duis quis
            mi tortor. Mauris id porta sapien, porttitor pharetra felis.
            Curabitur nibh enim, ullamcorper nec sem ac, auctor cursus ligula.
            Mauris at accumsan libero. Phasellus tincidunt commodo arcu, a
            sagittis nisi luctus sed. Orci varius natoque penatibus et magnis
            dis parturient montes, nascetur ridiculus mus. Donec mollis sem sed
            nunc pretium, nec iaculis ipsum convallis. Vivamus congue ex quis
            quam venenatis, eget congue nisi luctus. Nam efficitur rutrum lectus
            sed cursus. Sed vitae tortor vitae dolor euismod lacinia. Nullam at
            magna nibh. Aliquam id suscipit ipsum, non gravida nunc. Quisque
            elit purus, pulvinar id convallis pulvinar, hendrerit quis lectus.
            Praesent malesuada ut enim sed tincidunt. Nunc et mi mauris. Nam ac
            pharetra diam. Nunc tristique enim sit amet accumsan rhoncus. Mauris
            quis molestie magna, hendrerit porttitor leo. Ut diam ante, rhoncus
            sit amet facilisis in, fermentum at odio. Morbi nec fringilla
            tortor. Praesent aliquam ullamcorper accumsan. Nam tempor laoreet
            orci, at sodales dolor interdum eu. Vivamus vitae orci id leo
            interdum finibus ut ac urna. Duis vel orci hendrerit, efficitur mi
            eu, finibus dui. Phasellus lectus sapien, hendrerit vel congue ac,
            sagittis id libero. Maecenas eget ullamcorper ipsum. Morbi
            sollicitudin quam eu imperdiet convallis. In aliquam orci tortor.
            Morbi et ultrices lacus, sed pharetra magna. Integer eget ultrices
            metus. Suspendisse potenti. Nullam elementum dignissim nulla, non
            venenatis nibh elementum eget. Cras imperdiet aliquet enim eget
            euismod. Proin sodales finibus lorem sit amet gravida. Donec
            pellentesque, ligula consequat egestas dictum, elit mi aliquam
            risus, ac mollis magna erat sit amet nisi. Quisque in risus ornare,
            volutpat nunc vel, eleifend lectus. Mauris dictum placerat
            consectetur. Suspendisse auctor, diam vel feugiat condimentum, lacus
            mi vulputate sapien, at euismod lorem risus non tellus. Maecenas
            vestibulum nunc dui, dignissim consequat leo fermentum id. Duis quis
            mi tortor. Mauris id porta sapien, porttitor pharetra felis.
            Curabitur nibh enim, ullamcorper nec sem ac, auctor cursus ligula.
            Mauris at accumsan libero. Phasellus tincidunt commodo arcu, a
            sagittis nisi luctus sed. Orci varius natoque penatibus et magnis
            dis parturient montes, nascetur ridiculus mus. Donec mollis sem sed
            nunc pretium, nec iaculis ipsum convallis. Vivamus congue ex quis
            quam venenatis, eget congue nisi luctus. Nam efficitur rutrum lectus
            sed cursus. Sed vitae tortor vitae dolor euismod lacinia. Nullam at
            magna nibh. Aliquam id suscipit ipsum, non gravida nunc. Quisque
            elit purus, pulvinar id convallis pulvinar, hendrerit quis lectus.
            Praesent malesuada ut enim sed tincidunt. Nunc et mi mauris. Nam ac
            pharetra diam. Nunc tristique enim sit amet accumsan rhoncus. Mauris
            quis molestie magna, hendrerit porttitor leo. Ut diam ante, rhoncus
            sit amet facilisis in, fermentum at odio. Morbi nec fringilla
            tortor. Praesent aliquam ullamcorper accumsan. Nam tempor laoreet
            orci, at sodales dolor interdum eu. Vivamus vitae orci id leo
            interdum finibus ut ac urna. Duis vel orci hendrerit, efficitur mi
            eu, finibus dui. Phasellus lectus sapien, hendrerit vel congue ac,
            sagittis id libero. Maecenas eget ullamcorper ipsum. Morbi
            sollicitudin quam eu imperdiet convallis. In aliquam orci tortor.
            Morbi et ultrices lacus, sed pharetra magna. Integer eget ultrices
            metus. Suspendisse potenti. Nullam elementum dignissim nulla, non
            venenatis nibh elementum eget. Cras imperdiet aliquet enim eget
            euismod. Proin sodales finibus lorem sit amet gravida. Praesent aliquam ullamcorper accumsan. Nam tempor laoreet
            orci, at sodales dolor interdum eu. Vivamus vitae orci id leo
            interdum finibus ut ac urna. Duis vel orci hendrerit, efficitur mi
            eu, finibus dui. Phasellus lectus sapien, hendrerit vel congue ac,
            sagittis id libero. Maecenas eget ullamcorper ipsum. Morbi
            sollicitudin quam eu imperdiet convallis. In aliquam orci tortor.
            Morbi et ultrices lacus, sed pharetra magna. Integer eget ultrices
            metus. Suspendisse potenti. Nullam elementum dignissim nulla, non
            venenatis nibh elementum eget. Cras imperdiet aliquet enim eget
            euismod. Proin sodales finibus lorem sit amet gravida. Donec
            pellentesque, ligula consequat egestas dictum, elit mi aliquam
            risus, ac mollis magna erat sit amet nisi. Quisque in risus ornare,
            volutpat nunc vel, eleifend lectus. Mauris dictum placerat
            consectetur. Suspendisse auctor, diam vel feugiat condimentum, lacus
            mi vulputate sapien, at euismod lorem risus non tellus. Maecenas
            vestibulum nunc dui, dignissim consequat leo fermentum id. Duis quis
            mi tortor. Mauris id porta sapien, porttitor pharetra felis.
            Curabitur nibh enim, ullamcorper nec sem ac, auctor cursus ligula.
            Mauris at accumsan libero. Phasellus tincidunt commodo arcu, a
            sagittis nisi luctus sed. Orci varius natoque penatibus et magnis
            dis parturient montes, nascetur ridiculus mus. Donec mollis sem sed
            nunc pretium, nec iaculis ipsum convallis. Vivamus congue ex quis
            quam venenatis, eget congue nisi luctus. Nam efficitur rutrum lectus
            sed cursus. Sed vitae tortor vitae dolor euismod lacinia. Nullam at
            magna nibh. Aliquam id suscipit ipsum, non gravida nunc. Quisque
            elit purus, pulvinar id convallis pulvinar, hendrerit quis lectus.
            Praesent malesuada ut enim sed tincidunt. Nunc et mi mauris. Nam ac
            pharetra diam. Nunc tristique enim sit amet accumsan rhoncus. Mauris
            quis molestie magna, hendrerit porttitor leo. Ut diam ante, rhoncus
            sit amet facilisis in, fermentum at odio. Morbi nec fringilla
            tortor. Praesent aliquam ullamcorper accumsan. Nam tempor laoreet
            orci, at sodales dolor interdum eu. Vivamus vitae orci id leo
            interdum finibus ut ac urna. Duis vel orci hendrerit, efficitur mi
            eu, finibus dui. Phasellus lectus sapien, hendrerit vel congue ac,
            sagittis id libero. Maecenas eget ullamcorper ipsum. Morbi
            sollicitudin quam eu imperdiet convallis. In aliquam orci tortor.
            Morbi et ultrices lacus, sed pharetra magna. Integer eget ultrices
            metus. Suspendisse potenti. Nullam elementum dignissim nulla, non
            venenatis nibh elementum eget. Cras imperdiet aliquet enim eget
            euismod. Proin sodales finibus lorem sit amet gravida. Praesent aliquam ullamcorper accumsan. Nam tempor laoreet
            orci, at sodales dolor interdum eu. Vivamus vitae orci id leo
            interdum finibus ut ac urna. Duis vel orci hendrerit, efficitur mi
            eu, finibus dui. Phasellus lectus sapien, hendrerit vel congue ac,
            sagittis id libero. Maecenas eget ullamcorper ipsum. Morbi
            sollicitudin quam eu imperdiet convallis. In aliquam orci tortor.
            Morbi et ultrices lacus, sed pharetra magna. Integer eget ultrices
            metus. Suspendisse potenti. Nullam elementum dignissim nulla, non
            venenatis nibh elementum eget. Cras imperdiet aliquet enim eget
            euismod. Proin sodales finibus lorem sit amet gravida. Donec
            pellentesque, ligula consequat egestas dictum, elit mi aliquam
            risus, ac mollis magna erat sit amet nisi. Quisque in risus ornare,
            volutpat nunc vel, eleifend lectus. Mauris dictum placerat
            consectetur. Suspendisse auctor, diam vel feugiat condimentum, lacus
            mi vulputate sapien, at euismod lorem risus non tellus. Maecenas
            vestibulum nunc dui, dignissim consequat leo fermentum id. Duis quis
            mi tortor. Mauris id porta sapien, porttitor pharetra felis.
            Curabitur nibh enim, ullamcorper nec sem ac, auctor cursus ligula.
            Mauris at accumsan libero. Phasellus tincidunt commodo arcu, a
            sagittis nisi luctus sed. Orci varius natoque penatibus et magnis
            dis parturient montes, nascetur ridiculus mus. Donec mollis sem sed
            nunc pretium, nec iaculis ipsum convallis. Vivamus congue ex quis
            quam venenatis, eget congue nisi luctus. Nam efficitur rutrum lectus
            sed cursus. Sed vitae tortor vitae dolor euismod lacinia. Nullam at
            magna nibh. Aliquam id suscipit ipsum, non gravida nunc. Quisque
            elit purus, pulvinar id convallis pulvinar, hendrerit quis lectus.
            Praesent malesuada ut enim sed tincidunt. Nunc et mi mauris. Nam ac
            pharetra diam. Nunc tristique enim sit amet accumsan rhoncus. Mauris
            quis molestie magna, hendrerit porttitor leo. Ut diam ante, rhoncus
            sit amet facilisis in, fermentum at odio. Morbi nec fringilla
            tortor. Praesent aliquam ullamcorper accumsan. Nam tempor laoreet
            orci, at sodales dolor interdum eu. Vivamus vitae orci id leo
            interdum finibus ut ac urna. Duis vel orci hendrerit, efficitur mi
            eu, finibus dui. Phasellus lectus sapien, hendrerit vel congue ac,
            sagittis id libero. Maecenas eget ullamcorper ipsum. Morbi
            sollicitudin quam eu imperdiet convallis. In aliquam orci tortor.
            Morbi et ultrices lacus, sed pharetra magna. Integer eget ultrices
            metus. Suspendisse potenti. Nullam elementum dignissim nulla, non
            venenatis nibh elementum eget. Cras imperdiet aliquet enim eget
            euismod. Proin sodales finibus lorem sit amet gravida.
          </h3>
        </div>
      </div>
    </div>
  );
}
