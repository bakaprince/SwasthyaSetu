
// Force set correct Government User credentials to fix login loop
(function () {
    const govUser = {
        name: "Ministry Admin",
        type: "government",
        identifier: "admin@nha",
        department: "National Health Authority",
        token: "mock-token-for-demo"
    };

    // Set storage directly using the keys from AppConfig
    // Based on inspection, keys seem to be typical
    localStorage.setItem('swasthya_user', JSON.stringify(govUser));
    localStorage.setItem('swasthya_token', 'mock-token-for-demo');

    console.log('✅ Force-set Government User credentials');
})();
