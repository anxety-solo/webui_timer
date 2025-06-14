function createGithubLink() {
    const GITHUB_URL = 'https://github.com/anxety-solo';
    const LINK_TEXT = 'ANXETY';
    const LOG_PREFIX = '[WebUI-Timer]';
    const SEPARATOR = '\u2003•\u2003';

    // Attempts to add the GitHub link to the footer
    const tryAddGithubLink = () => {
        const footer = gradioApp().querySelector('#footer');
        if (!footer) {
            console.log(`${LOG_PREFIX}: Footer element not found yet, waiting...`);
            return false;
        }

        const reloadLink = footer.querySelector('a[onclick*="settings_restart_gradio"]');
        if (!reloadLink) {
            console.log(`${LOG_PREFIX}: "Reload UI" link not found in footer`);
            return false;
        }

        // Skip if link already exists
        if (footer.querySelector(`a[href="${GITHUB_URL}"]`)) {
            console.log(`${LOG_PREFIX}: GitHub link already exists, skipping`);
            return true;
        }

        try {
            const separator = document.createTextNode(SEPARATOR);
            const githubLink = document.createElement('a');

            githubLink.href = GITHUB_URL;
            githubLink.target = '_blank';
            githubLink.textContent = LINK_TEXT;

            // Insert elements after the reload link
            reloadLink.after(separator, githubLink);

            console.log(`${LOG_PREFIX}: Successfully added GitHub link to footer`);
            return true;
        } catch (error) {
            console.error(`${LOG_PREFIX}: Error adding GitHub link:`, error);
            return false;
        }
    };

    // Sets up MutationObserver to watch for footer changes
    const setupObserver = () => {
        console.log(`${LOG_PREFIX}: Setting up MutationObserver...`);

        const observer = new MutationObserver(() => {
            if (tryAddGithubLink()) {
                observer.disconnect();
                console.log(`${LOG_PREFIX}: Observer successfully added GitHub link`);
            }
        });

        observer.observe(gradioApp(), {
            childList: true,
            subtree: true
        });

        return observer;
    };

    // Initial attempt
    if (!tryAddGithubLink()) {
        setupObserver();
    } else {
        console.log(`${LOG_PREFIX}: GitHub link added on first attempt`);
    }
}

onUiLoaded(createGithubLink);