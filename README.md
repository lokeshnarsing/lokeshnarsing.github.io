# Narsing Lokesh — Behind the Interface

A responsive, interactive portfolio built with HTML, CSS and vanilla JavaScript. No build step or runtime dependencies are required.

## Preview

Run `python3 -m http.server 4173` from this directory and open http://localhost:4173.

## Interactive sections

- Follow a request through a client, Spring Boot service and database.
- Explore the development process and six skill laboratories: backend, data, web, quality, cloud and protocols.
- Change the EV charging power budget or connect ports to see equal-share allocation, capped at 22 kW per port.
- Try illustrative OCPP heartbeat and OCPI location exchanges.
- Select career milestones, connect directly by email or phone, and download the PDF résumé.

The Quality lab checks the same power allocation function used by the charging simulator. All system diagrams, protocol exchanges and deployment flows are local educational models; they do not connect to production services. The contact section provides direct email and phone links; there is no contact form.

Controls support keyboard navigation. Animations respect reduced-motion preferences and can be paused with the header control. The portfolio uses a light theme. Motion preferences are saved locally when browser storage is available.

Profile content lives in `index.html`, skill descriptions and simulations in `script.js`, and responsive styling in `styles.css`. The downloadable résumé is `Lokesh_Narsing_Resume.pdf`. Language and tool logos are local SVG assets in `assets/icons/`, with Devicon attribution and license included there.

The professional portrait is `assets/lokesh-professional-portrait.png`, edited from the original `my-img.png` with the built-in image generation tool. The original is unchanged; the complete editing prompt is in `assets/portrait-edit-notes.md`.
