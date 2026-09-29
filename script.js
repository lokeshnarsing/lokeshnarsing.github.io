/* Small, local simulations. No network requests or production telemetry. */
(() => {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* Storage is optional. */ } }
  };
  let motionPaused = storage.get('portfolio-motion') === 'paused' || reducedMotion.matches;
  const motionEnabled = () => !motionPaused && !reducedMotion.matches;
  const updateMotion = () => {
    root.dataset.motion = motionEnabled() ? 'playing' : 'paused';
    $('#motion-toggle').setAttribute('aria-pressed', String(!motionEnabled()));
    $('#motion-toggle').setAttribute('aria-label', motionEnabled() ? 'Pause animations' : 'Animations paused. Enable animations');
    $('#motion-toggle').title = motionEnabled() ? 'Pause animations' : 'Enable animations';
    $('#motion-toggle span').textContent = motionEnabled() ? 'Ⅱ' : '▷';
  };
  $('#motion-toggle').addEventListener('click', () => {
    motionPaused = !motionPaused;
    storage.set('portfolio-motion', motionPaused ? 'paused' : 'playing');
    updateMotion();
    if (reducedMotion.matches && !motionPaused) showToast('Reduced motion is enabled in your device settings.');
  });
  reducedMotion.addEventListener('change', () => { motionPaused = reducedMotion.matches; updateMotion(); });
  updateMotion();

  // Menu and keyboard navigation remain ordinary links and buttons.
  const setMenu = open => {
    $('#nav-links').classList.toggle('open', open);
    $('#menu-toggle').setAttribute('aria-expanded', String(open));
    $('#menu-toggle').setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  $('#menu-toggle').addEventListener('click', () => setMenu($('#menu-toggle').getAttribute('aria-expanded') !== 'true'));
  $('#nav-links').addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && $('#menu-toggle').getAttribute('aria-expanded') === 'true') {
      setMenu(false); $('#menu-toggle').focus();
    }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.nav')) setMenu(false); });
  matchMedia('(min-width: 701px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
  const links = $$('#nav-links a');
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-18% 0px -62% 0px' });
    links.forEach(link => { const section = $(link.hash); if (section) sectionObserver.observe(section); });
  }
  const setClock = () => { $('#local-clock').textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }).format(new Date()) + ' IST'; };
  setClock(); setInterval(() => { if (!document.hidden) setClock(); }, 60000);
  $('#year').textContent = new Date().getFullYear();

  // A shared animation clock completes interactions instantly in reduced motion.
  const animate = (duration, draw) => new Promise(resolve => {
    let start;
    const frame = now => {
      if (!motionEnabled()) { draw(1); resolve(); return; }
      start ??= now;
      const progress = Math.min((now - start) / duration, 1);
      draw(progress);
      if (progress < 1) requestAnimationFrame(frame); else resolve();
    };
    requestAnimationFrame(frame);
  });
  const wait = duration => animate(duration, () => {});
  const packet = $('#request-packet');
  const travel = (path, duration, reverse = false) => {
    const length = path.getTotalLength();
    return animate(duration, progress => {
      const point = path.getPointAtLength(length * (reverse ? 1 - progress : progress));
      packet.setAttribute('cx', point.x); packet.setAttribute('cy', point.y);
    });
  };
  let requestCount = 0;
  $('#send-request').addEventListener('click', async () => {
    const button = $('#send-request');
    if (button.disabled) return;
    button.disabled = true;
    $('#hero-system').setAttribute('aria-busy', 'true');
    packet.classList.add('running');
    $('#request-result').textContent = '01 → Client sends GET /stations';
    await travel($('#client-wire'), 750);
    $('[data-system-node="service"]').classList.add('processing');
    $('#request-result').textContent = '02 → Spring Boot handles the request';
    await wait(450);
    await travel($('#database-wire'), 650);
    $('[data-system-node="database"]').classList.add('processing');
    $('#request-result').textContent = '03 → Database returns station data';
    await wait(450);
    await travel($('#database-wire'), 450, true);
    await travel($('#client-wire'), 550, true);
    requestCount += 1;
    $('#request-result').textContent = `200 OK · Request ${String(requestCount).padStart(2, '0')} complete`;
    packet.classList.remove('running');
    $$('.processing').forEach(node => node.classList.remove('processing'));
    button.disabled = false;
    $('#hero-system').setAttribute('aria-busy', 'false');
  });

  const process = [
    ['Start with the real problem. Clarify requirements, ask questions and understand how people will use the system.', 'input → questions → a clear plan'],
    ['Give every layer a clear responsibility. Model the data, define the contracts and choose patterns that fit the problem.', 'requirements → contracts → architecture'],
    ['Translate the design into Java services, Spring controllers and persistence layers. Keep the logic focused and readable.', 'controller → service → repository'],
    ['Check the happy path and the awkward edge cases. Use JUnit, Mockito and API testing to find problems early.', 'arrange → act → assert ✓'],
    ['Review the code, run the pipeline and observe what happens next. Logs and production feedback close the loop.', 'Git → Jenkins → AWS → Kibana']
  ];
  $$('.process-step').forEach(button => button.addEventListener('click', () => {
    $$('.process-step').forEach(step => { const active = step === button; step.classList.toggle('active', active); step.setAttribute('aria-pressed', String(active)); });
    const [description, code] = process[Number(button.dataset.step)];
    $('#process-description').textContent = description; $('#process-code').textContent = code;
  }));

  const labs = {
    backend: {
      kicker:'THE ENGINE ROOM', title:'Logic that keeps things moving.', description:'From a REST request to business logic and back. I build services with clear boundaries and dependable behavior.', filename:'request-lifecycle.java', action:'Run a request',
      tools:[['Java','The foundation of my backend work: object-oriented business logic, collections and reliable services.'],['Spring Boot','Application configuration, REST controllers and services that connect the pieces of a backend.'],['Spring MVC','Separates request handling, application models and views into clear responsibilities.'],['Hibernate','Maps Java objects to relational data and manages persistence.'],['Spring JPA','Repository abstractions that keep data access focused and consistent.'],['Microservices','Service boundaries that organize capabilities and communicate through explicit contracts.'],['Singleton','A pattern for sharing one instance where the application needs a single point of coordination.'],['Factory','Encapsulates object creation so business logic can depend on an abstraction.'],['MVC','Separates the model, view and controller to keep presentation and behavior organized.'],['DAO','Isolates database operations behind a data access layer.']],
      scene:'<div class="backend-machine"><div class="machine-node"><b>↗</b><small>CONTROLLER</small><em>receive the request</em></div><div class="machine-wire"></div><div class="machine-node"><b>{ }</b><small>SERVICE</small><em>apply the logic</em></div><div class="machine-wire"></div><div class="machine-node database"><b>≡</b><small>REPOSITORY</small><em>work with data</em></div></div><span class="lab-scene-label">REQUEST → LOGIC → PERSISTENCE → RESPONSE</span>'
    },
    data: {
      kicker:'A PLACE FOR EVERYTHING', title:'Good data. Clear answers.', description:'Model the relationships. Query what matters. Keep application data structured, consistent and easy to retrieve.', filename:'find-active-stations.sql', action:'Run the query',
      tools:[['SQL','Select, filter and join relational data to give services the information they need.'],['MySQL','Relational storage used in the EVGateway platform for application and charging data.'],['Oracle','Relational database experience for working with structured application data.'],['Spring JPA','Connects Java repositories to persistent entities without repeating common data access code.'],['Hibernate','Handles the mapping between application objects, relationships and database tables.']],
      scene:'<div class="query-scene"><div class="query-line"><span>SELECT</span> * <span>FROM</span> stations<br /><span>WHERE</span> status = \'charging\';</div><table class="data-table"><thead><tr><th>ID</th><th>STATION</th><th>STATUS</th></tr></thead><tbody><tr data-match="true"><td>01</td><td>Hyderabad A</td><td>charging</td></tr><tr data-match="false"><td>02</td><td>Hyderabad B</td><td>idle</td></tr><tr data-match="true"><td>03</td><td>Hyderabad C</td><td>charging</td></tr></tbody></table></div><span class="lab-scene-label">SAMPLE DATA / SELECT ONLY WHAT YOU NEED</span>'
    },
    web: {
      kicker:'WHERE THE SYSTEM MEETS PEOPLE', title:'From server to screen.', description:'Operator portals need useful interfaces. I connect backend data to web pages for dashboards, accounting and charging statistics.', filename:'operator-portal.jsp', action:'Change viewport',
      tools:[['JavaScript','Adds browser interactions, responds to input and updates what users see.'],['jQuery','DOM interactions and page behavior in existing web applications.'],['JSP','Server-rendered pages connected to Java and Spring controllers.'],['JSON','A structured format for exchanging data between services and interfaces.'],['Spring MVC','Connects HTTP requests with controllers, models and rendered views.']],
      scene:'<div class="browser-model"><div class="browser-chrome"><i></i><i></i><i></i><span>EVG-PORTAL / PREVIEW</span></div><div class="browser-layout"><div class="mock-nav"></div><div class="mock-copy"><i></i><i></i><i></i><b>CHARGING OVERVIEW ↗</b></div><div class="mock-visual"><span>✳</span></div></div></div><span class="lab-scene-label">SAME INFORMATION / A DIFFERENT VIEWPORT</span>'
    },
    quality: {
      kicker:'CONFIDENCE BEFORE THE COMMIT', title:'Trust it. Then verify it.', description:'Check behavior in isolation, inspect APIs and look for issues before they reach production. Reliability is part of the implementation.', filename:'LoadManagerTest.java', action:'Run the tests',
      tools:[['JUnit','Tests business behavior and edge cases with repeatable assertions.'],['Mockito','Mocks collaborators to isolate the behavior under test.'],['Postman','Exercises service endpoints and inspects request and response contracts.'],['SonarQube','Static analysis that helps identify maintainability and code quality issues.'],['Log4j','Application logs for tracing behavior and investigating defects.'],['SLF4J','A consistent logging facade for application diagnostics.']],
      scene:'<div class="test-suite"><div class="test-heading"><span>✓</span> LoadManagerTest</div><div class="test-row"><span>splits power equally</span><b>READY</b></div><div class="test-row"><span>respects the port limit</span><b>READY</b></div><div class="test-row"><span>handles zero active ports</span><b>READY</b></div><div class="test-row"><span>stays within site capacity</span><b>READY</b></div></div><span class="lab-scene-label">RUNS CHECKS ON THE LOAD MODEL USED BELOW</span>'
    },
    cloud: {
      kicker:'ALL THE WAY TO PRODUCTION', title:'A commit is just the start.', description:'From version control to build pipelines, deployment and observation. I work across the delivery lifecycle to keep services running.', filename:'delivery-pipeline.yml', action:'Run the pipeline',
      tools:[['AWS','Cloud infrastructure for running and supporting application workloads.'],['Jenkins','CI/CD jobs that automate builds and delivery workflows.'],['Maven','Dependency management and repeatable builds for Java applications.'],['Git / GitHub','Version control, collaboration, code reviews and change history.'],['Kibana','Log exploration and service monitoring to understand production behavior.'],['Jira','Tracking requirements, defects and delivery work across the team.']],
      scene:'<div class="deploy-scene"><div class="deployment-stages"><div class="deploy-node"><b>⌘</b><span>COMMIT</span></div><div class="deploy-node"><b>⬡</b><span>BUILD</span></div><div class="deploy-node"><b>✓</b><span>VERIFY</span></div><div class="deploy-node"><b>↑</b><span>DEPLOY</span></div><div class="deploy-node"><b>⌁</b><span>OBSERVE</span></div></div><div class="deploy-log">Git → Maven → Jenkins → AWS → Kibana</div></div><span class="lab-scene-label">ILLUSTRATIVE PIPELINE / EVERY STEP HAS A PURPOSE</span>'
    },
    protocols: {
      kicker:'SYSTEMS THAT SPEAK TO EACH OTHER', title:'Make the connection.', description:'From standard web services to EV-specific protocols. Clear contracts let stations, operators and mobility providers work together.', filename:'network-handshake.json', action:'Send a message',
      tools:[['RESTful APIs','HTTP endpoints with clear request and response contracts for application integration.'],['SOAP','Structured XML-based service integration for systems using SOAP contracts.'],['OCPP','Connects charging stations to their central management system for monitoring and control.'],['OCPI','Lets charging operators and mobility providers exchange data across networks.'],['JSON','Structured message payloads for API and protocol exchanges.']],
      scene:'<div class="protocol-scene"><div class="mini-network"><b>ϟ</b><span>CHARGE POINT</span></div><div class="network-channel"><span>REQUEST ⇄ RESPONSE</span><i></i></div><div class="mini-network"><b>{ }</b><span>CENTRAL SYSTEM</span></div></div><span class="lab-scene-label">SHARED CONTRACTS / CONNECTED SYSTEMS</span>'
    }
  };
  // Brand assets are local so the toolkit does not depend on an icon CDN.
  const brandIcons = {
    Java:'java', 'Spring Boot':'spring', 'Spring MVC':'spring', 'Spring JPA':'spring',
    Hibernate:'hibernate', MySQL:'mysql', Oracle:'oracle', JavaScript:'javascript',
    jQuery:'jquery', JSP:'java', JSON:'json', JUnit:'junit', Postman:'postman',
    SonarQube:'sonarqube', AWS:'aws', Jenkins:'jenkins', Maven:'maven',
    'Git / GitHub':'github', Kibana:'kibana', Jira:'jira'
  };
  const conceptPaths = {
    database:'M4 6c0-4 16-4 16 0s-16 4-16 0Zm0 0v12c0 4 16 4 16 0V6M4 12c0 4 16 4 16 0',
    network:'M8 7h8M7 9v6m10-6v6M8 17h8M3 3h6v6H3Zm12 0h6v6h-6ZM3 15h6v6H3Zm12 0h6v6h-6Z',
    code:'m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18',
    tests:'M9 3h6m-5 0v7L4 19c-1 2 0 2 2 2h12c2 0 3 0 2-2l-6-9V3M7 16h10',
    logs:'M6 3h12v18H6ZM9 7h6m-6 5h6m-6 5h4',
    power:'m13 2-9 12h7l-1 8 10-13h-8Z'
  };
  const conceptIcons = {SQL:'database',DAO:'database',Microservices:'network',Singleton:'network',Factory:'network',MVC:'network',Mockito:'tests',Log4j:'logs',SLF4J:'logs','RESTful APIs':'code',SOAP:'code',OCPP:'power',OCPI:'network'};
  const makeSkillIcon = name => {
    if (brandIcons[name]) {
      const icon = document.createElement('img');
      icon.src = `assets/icons/${brandIcons[name]}.svg`;
      icon.alt = ''; icon.width = 22; icon.height = 22; icon.className = 'skill-icon';
      return icon;
    }
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24'); icon.setAttribute('aria-hidden', 'true');
    icon.setAttribute('class', 'skill-icon'); icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor'); icon.setAttribute('stroke-width', '1.5');
    icon.setAttribute('stroke-linecap', 'round'); icon.setAttribute('stroke-linejoin', 'round');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', conceptPaths[conceptIcons[name] || 'code']); icon.append(path);
    return icon;
  };
  let currentLab = 'backend';
  let labRun = 0;
  const focusTool = (index, key = currentLab) => {
    const items = labs[key].tools;
    $('#tool-name').replaceChildren(makeSkillIcon(items[index][0]), document.createTextNode(items[index][0]));
    $('#tool-description').textContent = items[index][1];
    $('#tool-index').textContent = `${String(index + 1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;
    $$('.skill-token').forEach((button, buttonIndex) => button.setAttribute('aria-pressed', String(index === buttonIndex)));
  };
  const selectLab = key => {
    currentLab = key; labRun += 1;
    const lab = labs[key];
    $$('.lab-tabs [role="tab"]').forEach(tab => { const active = tab.dataset.lab === key; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    $('#skill-panel').setAttribute('aria-labelledby', `tab-${key}`);
    $('#lab-kicker').textContent = lab.kicker; $('#lab-title').textContent = lab.title;
    $('#lab-description').textContent = lab.description; $('#lab-filename').textContent = lab.filename;
    $('#lab-scene').innerHTML = lab.scene;
    $('#run-lab').replaceChildren(document.createTextNode(lab.action + ' '));
    const arrow = document.createElement('span'); arrow.textContent = '↗'; $('#run-lab').append(arrow);
    $('#run-lab').disabled = false;
    $('#lab-status').textContent = 'Waiting for input';
    $('#skill-tokens').replaceChildren();
    lab.tools.forEach(([name], index) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'skill-token';
      button.append(makeSkillIcon(name), document.createTextNode(name));
      button.setAttribute('aria-pressed', String(index === 0));
      button.addEventListener('click', () => focusTool(index, key)); $('#skill-tokens').append(button);
    });
    focusTool(0, key);
  };
  const configureTabs = (selector, select) => {
    const tabs = $$(selector);
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault(); tabs[next].focus(); select(tabs[next]);
      });
    });
  };
  configureTabs('.lab-tabs [role="tab"]', tab => selectLab(tab.dataset.lab));
  selectLab('backend');

  // The same equal-share calculation powers the chargers and the Quality demo.
  const distribute = (limit, active) => {
    const share = active > 0 ? Math.min(limit / active, 22) : 0;
    return { share, total: share * active };
  };
  $('#run-lab').addEventListener('click', async () => {
    const button = $('#run-lab');
    if (button.disabled) return;
    const run = ++labRun;
    const key = currentLab;
    const scene = $('#lab-scene');
    const valid = () => run === labRun;
    const status = text => { if (valid()) $('#lab-status').textContent = text; };
    button.disabled = true;
    if (key === 'backend') {
      const nodes = $$('.machine-node', scene);
      const messages = ['Request received', 'Business logic executed', 'Data retrieved'];
      for (let i = 0; i < nodes.length; i++) {
        if (!valid()) return;
        nodes.forEach(node => node.classList.remove('hot')); nodes[i].classList.add('hot'); status(messages[i]);
        await wait(600);
      }
      status('200 OK · Response returned');
    } else if (key === 'data') {
      const rows = $$('tbody tr', scene);
      rows.forEach(row => row.classList.remove('matched'));
      for (const row of rows) {
        if (!valid()) return;
        row.classList.add('scanning'); status('Filtering station records…'); await wait(450);
        row.classList.remove('scanning'); row.classList.toggle('matched', row.dataset.match === 'true');
      }
      status('2 matching rows returned');
    } else if (key === 'web') {
      const mobile = $('.browser-model', scene).classList.toggle('mobile');
      status(mobile ? 'Mobile layout · One column' : 'Desktop layout · Two columns');
    } else if (key === 'quality') {
      const checks = [
        () => distribute(66, 4).share === 16.5,
        () => distribute(132, 1).share === 22,
        () => distribute(66, 0).share === 0 && distribute(66, 0).total === 0,
        () => [22, 44, 66, 132].every(limit => [0, 1, 3, 6].every(active => distribute(limit, active).total <= limit))
      ];
      const rows = $$('.test-row', scene); let passed = 0;
      rows.forEach(row => { row.classList.remove('passed'); $('b', row).textContent = 'READY'; });
      for (let i = 0; i < rows.length; i++) {
        if (!valid()) return;
        rows[i].classList.add('running'); $('b', rows[i]).textContent = 'RUNNING'; status(`Checking ${i + 1} / 4…`);
        await wait(500);
        const result = checks[i](); if (result) passed += 1;
        rows[i].classList.remove('running'); rows[i].classList.toggle('passed', result); $('b', rows[i]).textContent = result ? '✓ PASS' : 'FAIL';
      }
      status(`${passed} / 4 checks passed`);
    } else if (key === 'cloud') {
      const stages = $$('.deploy-node', scene);
      const messages = ['Commit checked out','Build completed','Checks passed','Deployed to AWS','Logs ready in Kibana'];
      stages.forEach(stage => stage.classList.remove('done'));
      for (let i = 0; i < stages.length; i++) {
        if (!valid()) return;
        status(messages[i]); stages[i].classList.add('done'); await wait(450);
      }
      status('Pipeline complete · Model deployment');
    } else {
      status('Station → server: Heartbeat'); await wait(700);
      if (!valid()) return;
      $('.mini-network:last-of-type b', scene).style.borderColor = 'var(--lime)';
      status('Server → station: Acknowledged');
    }
    if (valid()) button.disabled = false;
  });

  configureTabs('.project-tabs [role="tab"]', selected => {
    $$('.project-tabs [role="tab"]').forEach(tab => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
      $(`#project-${tab.dataset.project}`).hidden = !active;
    });
  });
  const ports = [true, true, true, false, true, false];
  const portNames = ['A1','A2','B1','B2','C1','C2'];
  const portButtons = ports.map((_, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'charger';
    button.innerHTML = '<span class="charger-body" aria-hidden="true"><span class="charger-screen"><i></i>ϟ</span><span class="charger-led"></span></span><span class="charger-name"></span><span class="charger-kw"></span>';
    $('.charger-name', button).textContent = 'PORT ' + portNames[index];
    button.addEventListener('click', () => { ports[index] = !ports[index]; renderLoad(); });
    $('#lm-ports').append(button); return button;
  });
  function renderLoad() {
    const limit = Number($('#lm-limit').value);
    const active = ports.filter(Boolean).length;
    const { share, total } = distribute(limit, active);
    $('#lm-limit-label').textContent = limit;
    $('#lm-limit').setAttribute('aria-valuetext', `${limit} kilowatts`);
    $('#lm-limit').style.setProperty('--range-fill', ((limit - 22) / 110 * 100) + '%');
    portButtons.forEach((button, index) => {
      const on = ports[index];
      button.setAttribute('aria-pressed', String(on));
      button.setAttribute('aria-label', `Port ${portNames[index]}, ${on ? `charging at ${share.toFixed(1)} kilowatts. Click to disconnect.` : 'disconnected. Click to connect.'}`);
      $('.charger-kw', button).textContent = on ? share.toFixed(1) + ' kW' : 'offline';
      button.style.setProperty('--charge', on ? (share / 22 * 100) + '%' : '0%');
    });
    $('#lm-summary').replaceChildren();
    [['CONNECTED', `${active} / 6 ports`],['ALLOCATED', total.toFixed(1) + ' kW'],['HEADROOM', (limit - total).toFixed(1) + ' kW']].forEach(([label, value]) => {
      const item = document.createElement('div'); const name = document.createElement('span'); const number = document.createElement('b');
      name.textContent = label; number.textContent = value; item.append(name, number); $('#lm-summary').append(item);
    });
  }
  $('#lm-limit').addEventListener('input', renderLoad); renderLoad();

  let heartbeatCount = 0;
  $('#ocpp-send').addEventListener('click', async () => {
    const button = $('#ocpp-send'); if (button.disabled) return;
    button.disabled = true; $('#ocpp-map').classList.remove('running');
    // Restart only the requested exchange, with an immediate result in reduced motion.
    await wait(30); $('#ocpp-map').classList.add('running');
    $('#ocpp-log').textContent = 'Charge point → central server: Heartbeat'; await wait(850);
    $('#ocpp-log').textContent = 'Central server → charge point: currentTime acknowledged'; await wait(850);
    heartbeatCount += 1; $('#ocpp-log').textContent = `✓ Exchange ${heartbeatCount} complete. Station is connected; heartbeat acknowledged.`;
    $('#ocpp-map').classList.remove('running'); button.disabled = false;
  });
  $('#ocpi-send').addEventListener('click', async () => {
    const button = $('#ocpi-send'); if (button.disabled) return;
    button.disabled = true; $('#ocpi-map').classList.remove('connected');
    $('#ocpi-log').textContent = 'Mobility provider → charging operator: request locations'; await wait(900);
    $('#ocpi-map').classList.add('connected');
    $('#ocpi-log').textContent = '✓ Location data received. The provider can now display the operator’s stations.';
    button.disabled = false;
  });

  const jobs = {
    evgateway: { label:'BUILDING THE EV ECOSYSTEM', title:'Software Developer', company:'EVGateway India Private Limited', points:['Analyze requirements and implement Java features for EVG-Server and EVG-Portal.','Build REST endpoints and JSP pages with Spring Boot controllers.','Implement persistence with Hibernate and Spring JPA, integrating SOAP and REST services.','Distribute site power across charging ports with load management.','Maintain Jenkins pipelines and monitor services with Kibana on AWS.'], footer:'JAVA / SPRING BOOT / OCPP / OCPI / AWS' },
    cognizant: { label:'BUILDING THE FOUNDATIONS', title:'Programmer Analyst', company:'Cognizant Technology Solutions Private Limited', points:['Develop and maintain Java and Spring applications in an Agile team.','Write JUnit tests and use Mockito to isolate application behavior.','Trace issues with Log4j and fix defects reported in testing and production.','Participate in code reviews, manage changes with Git and track work in Jira.'], footer:'JAVA / SPRING MVC / HIBERNATE / JUNIT / GIT' }
  };
  $$('.commit[data-job]').forEach(button => button.addEventListener('click', () => {
    $$('.commit[data-job]').forEach(commit => { commit.classList.toggle('active', commit === button); commit.setAttribute('aria-pressed', String(commit === button)); });
    const job = jobs[button.dataset.job];
    $('#job-label').textContent = job.label; $('#job-title').textContent = job.title; $('#job-company').textContent = job.company; $('#job-footer').textContent = job.footer;
    $('#job-points').replaceChildren(...job.points.map(point => { const item = document.createElement('li'); item.textContent = point; return item; }));
  }));

  let toastTimer;
  function showToast(message) {
    $('#toast').textContent = message; $('#toast').classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3500);
  }
  $('#copy-email').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('narsinglokesh1998@gmail.com'); showToast('Email copied. Let’s make something good.'); }
    catch { showToast('Select the email address above to copy it.'); }
  });
})();
