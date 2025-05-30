// Main function
function createGithubLink() {
    const addGithubLink = () => {
        const footer = gradioApp().querySelector('#footer');
        if (!footer) {
            console.log('[WebUI-Timer]: Footer element not found yet, waiting...');
            return false;
        }

        const reloadLink = footer.querySelector('a[onclick*="settings_restart_gradio"]');
        if (!reloadLink) {
            console.log('[WebUI-Timer]: "Reload UI" link not found in footer');
            return false;
        }

        // Check if the link has already been added
        if (footer.querySelector('a[href="https://github.com/anxety-solo"]')) {
            console.log('[WebUI-Timer]: GitHub link already exists, skipping');
            return true;
        }

        // Create a delimiter with correct spaces
        const separator = document.createTextNode("\u2003•\u2003");
        const newLink = document.createElement('a');
        newLink.href = 'https://github.com/anxety-solo';
        newLink.target = '_blank';
        newLink.textContent = 'ANXETY';

        // Insert after the “Reload UI” link
        reloadLink.parentNode.insertBefore(separator, reloadLink.nextSibling);
        reloadLink.parentNode.insertBefore(newLink, reloadLink.nextSibling.nextSibling);

        console.log('[WebUI-Timer]: Successfully added GitHub link to footer');
        return true;
    };

    // Trying to add it all at once
    if (!addGithubLink()) {
        console.log('[WebUI-Timer]: Initial attempt to add GitHub link failed, setting up observer...');

        // If the footer is not yet available, use MutationObserver
        const observer = new MutationObserver((mutations) => {
            if (addGithubLink()) {
                console.log('[WebUI-Timer]: Observer successfully added GitHub link');
                observer.disconnect();
            }
        });

        observer.observe(gradioApp(), {
            childList: true,
            subtree: true
        });
    } else {
        console.log('[WebUI-Timer]: GitHub link added on first attempt');
    }
}

onUiLoaded(createGithubLink);