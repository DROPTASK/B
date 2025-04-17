// Main JavaScript for CryptoDrops Airdrop Tracker
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

// ==========================================
// APPLICATION INITIALIZATION
// ==========================================
function initApp() {
    // Initialize theme based on user preference
    initTheme();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize modals
    initModals();
    
    // Load data from localStorage or set defaults
    loadData();
    
    // Initialize all charts
    initCharts();
    
    // Initialize event handlers
    initEventHandlers();
    
    // Update UI with loaded data
    updateUI();
    
    // Check if daily tasks need to be reset
    checkDailyTasksReset();
}

// ==========================================
// THEME MANAGEMENT
// ==========================================
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light-theme';
    
    // Set initial theme
    document.body.className = currentTheme;
    
    // Update theme toggle icon
    updateThemeToggleIcon();
    
    // Add event listener for theme toggle
    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    if (document.body.classList.contains('light-theme')) {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        localStorage.setItem('theme', 'light-theme');
    }
    
    updateThemeToggleIcon();
    updateAllCharts();
}

function updateThemeToggleIcon() {
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');
    
    if (document.body.classList.contains('light-theme')) {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }
}

// ==========================================
// NAVIGATION
// ==========================================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.getAttribute('data-section');
            showSection(sectionId);
            updateActiveNavItem(item);
        });
    });
    
    // Handle back button in project details
    document.getElementById('back-to-explore').addEventListener('click', () => {
        showSection('explore-section');
        updateActiveNavItem(document.querySelector('.nav-item[data-section="explore-section"]'));
    });
}

function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('main section');
    sections.forEach(section => {
        section.classList.remove('active-section');
        section.classList.add('hidden-section');
    });
    
    // Show selected section
    const activeSection = document.getElementById(sectionId);
    activeSection.classList.remove('hidden-section');
    activeSection.classList.add('active-section');
    activeSection.classList.add('fade-in');
    
    // Special case for project details section
    if (sectionId === 'project-details-section') {
        document.getElementById('back-to-explore').classList.remove('hidden');
    } else {
        // Hide back button if not in project details
        if (document.getElementById('back-to-explore')) {
            document.getElementById('back-to-explore').classList.add('hidden');
        }
    }
}

function updateActiveNavItem(activeItem) {
    // Remove active class from all nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked item
    activeItem.classList.add('active');
}

// ==========================================
// MODAL MANAGEMENT
// ==========================================
function initModals() {
    // Close buttons in modals
    const closeButtons = document.querySelectorAll('.close-modal, [data-close-modal]');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal') || button.getAttribute('data-close-modal');
            closeModal(modalId);
        });
    });
    
    // Open investment modal
    document.getElementById('add-investment-btn').addEventListener('click', () => {
        openModal('add-investment-modal');
    });
    
    // Open task modal
    document.getElementById('add-task-btn').addEventListener('click', () => {
        openModal('add-task-modal');
    });
    
    // Toggle project field in task modal
    document.getElementById('task-type').addEventListener('change', function() {
        const projectFieldGroup = document.getElementById('project-task-form-group');
        if (this.value === 'project') {
            projectFieldGroup.style.display = 'block';
        } else {
            projectFieldGroup.style.display = 'none';
        }
    });
    
    // Form submissions
    document.getElementById('investment-form').addEventListener('submit', handleInvestmentFormSubmit);
    document.getElementById('task-form').addEventListener('submit', handleTaskFormSubmit);
    
    // Set default date for forms
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transaction-date').value = today;
    document.getElementById('task-due-date').value = today;
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    
    // Populate project selects if needed
    if (modalId === 'add-investment-modal') {
        populateProjectSelect('project-select');
    } else if (modalId === 'add-task-modal') {
        populateProjectSelect('task-project');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    
    // Reset forms
    if (modalId === 'add-investment-modal') {
        document.getElementById('investment-form').reset();
    } else if (modalId === 'add-task-modal') {
        document.getElementById('task-form').reset();
        document.getElementById('project-task-form-group').style.display = 'none';
    }
}

function populateProjectSelect(selectId) {
    const select = document.getElementById(selectId);
    
    // Clear existing options except the first one if it's a placeholder
    while (select.options.length > 0) {
        select.remove(0);
    }
    
    // Add projects
    appData.projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        select.appendChild(option);
    });
}

// ==========================================
// DATA MANAGEMENT
// ==========================================
// App data object
let appData = {
    projects: [],
    investments: [],
    earnings: [],
    tasks: [],
    activities: [],
    news: []
};

function loadData() {
    // Load data from localStorage
    const savedData = localStorage.getItem('cryptoDropsData');
    
    if (savedData) {
        appData = JSON.parse(savedData);
    } else {
        // Initialize with default data if nothing is saved
        initializeDefaultData();
    }
}

function saveData() {
    localStorage.setItem('cryptoDropsData', JSON.stringify(appData));
}

function initializeDefaultData() {
    // Initialize with 21 crypto projects
    appData.projects = [
        {
            id: 'project-1',
            name: 'Ethereum 2.0',
            symbol: 'ETH',
            logo: 'fa-ethereum',
            category: 'Layer 1',
            status: 'active',
            description: 'Ethereum upgrade to proof-of-stake consensus mechanism with improved scalability and reduced energy consumption.',
            website: 'https://ethereum.org',
            startDate: '2022-01-15',
            airdropDate: '2023-08-30',
            estimatedValue: 5000,
            requirements: [
                'Hold ETH tokens',
                'Stake in ETH 2.0 contract',
                'Participate in testnet'
            ],
            activities: [
                {
                    date: '2023-01-10',
                    title: 'Testnet Participation',
                    description: 'Participated in the Ethereum 2.0 testnet validation.'
                },
                {
                    date: '2023-03-22',
                    title: 'Stake Increased',
                    description: 'Increased stake in the ETH 2.0 contract.'
                }
            ],
            tasks: [
                'Stake minimum 32 ETH',
                'Run validator node',
                'Complete testnet challenges'
            ]
        },
        {
            id: 'project-2',
            name: 'Arbitrum',
            symbol: 'ARB',
            logo: 'fa-layer-group',
            category: 'Layer 2',
            status: 'active',
            description: 'Ethereum Layer 2 scaling solution using Optimistic Rollups to increase transaction throughput and reduce fees.',
            website: 'https://arbitrum.io',
            startDate: '2022-05-20',
            airdropDate: '2023-07-15',
            estimatedValue: 2000,
            requirements: [
                'Use Arbitrum network',
                'Bridge assets to Arbitrum',
                'Interact with Arbitrum protocols'
            ],
            activities: [
                {
                    date: '2023-02-05',
                    title: 'Asset Bridge',
                    description: 'Bridged ETH to Arbitrum network.'
                },
                {
                    date: '2023-04-12',
                    title: 'DeFi Interaction',
                    description: 'Started using DeFi protocols on Arbitrum.'
                }
            ],
            tasks: [
                'Bridge at least 0.5 ETH',
                'Swap tokens on Arbitrum DEX',
                'Provide liquidity on Arbitrum'
            ]
        },
        {
            id: 'project-3',
            name: 'Optimism',
            symbol: 'OP',
            logo: 'fa-bolt',
            category: 'Layer 2',
            status: 'active',
            description: 'Ethereum Layer 2 scaling solution using Optimistic Rollups for lower fees and higher throughput.',
            website: 'https://optimism.io',
            startDate: '2022-03-10',
            airdropDate: '2023-09-05',
            estimatedValue: 1800,
            requirements: [
                'Use Optimism network',
                'Bridge assets to Optimism',
                'Interact with Optimism protocols'
            ],
            activities: [],
            tasks: [
                'Bridge at least 0.5 ETH',
                'Use at least 3 dApps on Optimism',
                'Participate in governance voting'
            ]
        },
        {
            id: 'project-4',
            name: 'Solana',
            symbol: 'SOL',
            logo: 'fa-sun',
            category: 'Layer 1',
            status: 'active',
            description: 'High-performance blockchain supporting smart contracts with fast transactions and low fees.',
            website: 'https://solana.com',
            startDate: '2022-02-28',
            airdropDate: '2023-10-20',
            estimatedValue: 3000,
            requirements: [
                'Hold SOL tokens',
                'Stake SOL',
                'Use Solana DeFi protocols'
            ],
            activities: [],
            tasks: [
                'Stake minimum 10 SOL',
                'Use Solana NFT marketplace',
                'Participate in Solana hackathon'
            ]
        },
        {
            id: 'project-5',
            name: 'Aptos',
            symbol: 'APT',
            logo: 'fa-bezier-curve',
            category: 'Layer 1',
            status: 'upcoming',
            description: 'New Layer 1 blockchain created by former Facebook Diem developers focused on security and scalability.',
            website: 'https://aptoslabs.com',
            startDate: '2023-06-15',
            airdropDate: '2024-01-15',
            estimatedValue: 2500,
            requirements: [
                'Participate in testnet',
                'Create Aptos wallet',
                'Perform testnet transactions'
            ],
            activities: [],
            tasks: [
                'Run testnet node',
                'Submit bug reports',
                'Create testnet NFTs'
            ]
        },
        {
            id: 'project-6',
            name: 'Sui',
            symbol: 'SUI',
            logo: 'fa-water',
            category: 'Layer 1',
            status: 'upcoming',
            description: 'High-performance Layer 1 blockchain with a focus on asset-centric programming model.',
            website: 'https://sui.io',
            startDate: '2023-07-10',
            airdropDate: '2023-12-15',
            estimatedValue: 2200,
            requirements: [
                'Participate in testnet',
                'Create Sui wallet',
                'Complete testnet challenges'
            ],
            activities: [],
            tasks: [
                'Run Sui node',
                'Complete Discord quests',
                'Create Sui Move modules'
            ]
        },
        {
            id: 'project-7',
            name: 'ZkSync',
            symbol: 'ZKS',
            logo: 'fa-link',
            category: 'Layer 2',
            status: 'active',
            description: 'Ethereum Layer 2 scaling solution using ZK-Rollups for secure and scalable transactions.',
            website: 'https://zksync.io',
            startDate: '2022-07-01',
            airdropDate: '2023-11-10',
            estimatedValue: 1500,
            requirements: [
                'Use ZkSync network',
                'Bridge assets to ZkSync',
                'Interact with ZkSync protocols'
            ],
            activities: [],
            tasks: [
                'Bridge at least 0.2 ETH',
                'Perform at least 10 transactions',
                'Use ZkSync NFT platform'
            ]
        },
        {
            id: 'project-8',
            name: 'Starknet',
            symbol: 'STRK',
            logo: 'fa-asterisk',
            category: 'Layer 2',
            status: 'active',
            description: 'Ethereum Layer 2 scaling solution using STARK proofs for high security and throughput.',
            website: 'https://starknet.io',
            startDate: '2022-06-15',
            airdropDate: '2023-10-05',
            estimatedValue: 1800,
            requirements: [
                'Use Starknet network',
                'Deploy smart contracts on Starknet',
                'Bridge assets to Starknet'
            ],
            activities: [],
            tasks: [
                'Bridge at least 0.3 ETH',
                'Deploy a Cairo contract',
                'Use Starknet dApps'
            ]
        },
        {
            id: 'project-9',
            name: 'Celestia',
            symbol: 'TIA',
            logo: 'fa-globe',
            category: 'Modular Blockchain',
            status: 'upcoming',
            description: 'Modular blockchain network focused on data availability and scalability.',
            website: 'https://celestia.org',
            startDate: '2023-08-20',
            airdropDate: '2024-02-10',
            estimatedValue: 2000,
            requirements: [
                'Run Celestia light node',
                'Participate in testnet',
                'Complete community tasks'
            ],
            activities: [],
            tasks: [
                'Run testnet validator',
                'Bridge assets to testnet',
                'Submit network improvements'
            ]
        },
        {
            id: 'project-10',
            name: 'Mantle',
            symbol: 'MNT',
            logo: 'fa-mountain',
            category: 'Layer 2',
            status: 'upcoming',
            description: 'Ethereum Layer 2 scaling solution with data availability layer and fraud proofs.',
            website: 'https://mantle.xyz',
            startDate: '2023-09-01',
            airdropDate: '2024-03-15',
            estimatedValue: 1600,
            requirements: [
                'Use Mantle testnet',
                'Bridge assets to Mantle',
                'Complete testnet tasks'
            ],
            activities: [],
            tasks: [
                'Deploy contract on testnet',
                'Provide feedback on documentation',
                'Participate in community governance'
            ]
        },
        {
            id: 'project-11',
            name: 'Polygon zkEVM',
            symbol: 'MATIC',
            logo: 'fa-octagon',
            category: 'Layer 2',
            status: 'active',
            description: 'Ethereum Layer 2 scaling solution using ZK proofs with full EVM compatibility.',
            website: 'https://polygon.technology/polygon-zkevm',
            startDate: '2022-11-15',
            airdropDate: '2023-09-25',
            estimatedValue: 2200,
            requirements: [
                'Use Polygon zkEVM network',
                'Bridge assets to zkEVM',
                'Interact with protocols on zkEVM'
            ],
            activities: [],
            tasks: [
                'Bridge at least 0.25 ETH',
                'Use at least 5 dApps on zkEVM',
                'Provide liquidity on DEXes'
            ]
        },
        {
            id: 'project-12',
            name: 'LayerZero',
            symbol: 'ZRO',
            logo: 'fa-network-wired',
            category: 'Interoperability',
            status: 'active',
            description: 'Cross-chain interoperability protocol enabling communication between blockchains.',
            website: 'https://layerzero.network',
            startDate: '2022-09-10',
            airdropDate: '2023-11-20',
            estimatedValue: 2000,
            requirements: [
                'Use LayerZero bridges',
                'Perform cross-chain transactions',
                'Interact with LayerZero dApps'
            ],
            activities: [],
            tasks: [
                'Bridge assets across at least 3 chains',
                'Use Stargate Finance',
                'Participate in cross-chain governance'
            ]
        },
        {
            id: 'project-13',
            name: 'Scroll',
            symbol: 'SCRL',
            logo: 'fa-scroll',
            category: 'Layer 2',
            status: 'upcoming',
            description: 'zkEVM-based Ethereum Layer 2 scaling solution focusing on privacy and scalability.',
            website: 'https://scroll.io',
            startDate: '2023-07-25',
            airdropDate: '2024-01-30',
            estimatedValue: 1800,
            requirements: [
                'Use Scroll testnet',
                'Deploy contracts on Scroll',
                'Bridge assets to testnet'
            ],
            activities: [],
            tasks: [
                'Complete testnet challenges',
                'Provide feedback on UX',
                'Report bugs in the testnet'
            ]
        },
        {
            id: 'project-14',
            name: 'Taiko',
            symbol: 'TKO',
            logo: 'fa-drum',
            category: 'Layer 2',
            status: 'upcoming',
            description: 'Decentralized, Ethereum-equivalent ZK-Rollup with high security and full EVM compatibility.',
            website: 'https://taiko.xyz',
            startDate: '2023-08-05',
            airdropDate: '2024-02-15',
            estimatedValue: 1700,
            requirements: [
                'Participate in testnet',
                'Bridge assets to Taiko',
                'Deploy contracts on testnet'
            ],
            activities: [],
            tasks: [
                'Run Taiko node',
                'Deploy and verify smart contracts',
                'Submit proposals for improvement'
            ]
        },
        {
            id: 'project-15',
            name: 'Linea',
            symbol: 'LINE',
            logo: 'fa-wave-square',
            category: 'Layer 2',
            status: 'active',
            description: 'Ethereum Layer 2 scaling solution by ConsenSys with secure and scalable transactions.',
            website: 'https://linea.build',
            startDate: '2023-03-15',
            airdropDate: '2023-10-15',
            estimatedValue: 2100,
            requirements: [
                'Use Linea network',
                'Bridge assets to Linea',
                'Interact with Linea protocols'
            ],
            activities: [],
            tasks: [
                'Bridge at least 0.5 ETH',
                'Use at least 3 DeFi protocols',
                'Perform at least 20 transactions'
            ]
        },
        {
            id: 'project-16',
            name: 'Base',
            symbol: 'BASE',
            logo: 'fa-layer-group',
            category: 'Layer 2',
            status: 'active',
            description: 'Coinbase-backed Ethereum Layer 2 scaling solution using Optimistic Rollups.',
            website: 'https://base.org',
            startDate: '2023-02-22',
            airdropDate: '2023-11-01',
            estimatedValue: 2500,
            requirements: [
                'Use Base network',
                'Bridge assets to Base',
                'Interact with Base protocols'
            ],
            activities: [],
            tasks: [
                'Bridge at least 0.5 ETH',
                'Trade on Base DEXes',
                'Mint NFTs on Base'
            ]
        },
        {
            id: 'project-17',
            name: 'Fuel',
            symbol: 'FUEL',
            logo: 'fa-fire',
            category: 'Layer 1',
            status: 'upcoming',
            description: 'High-performance modular execution layer with parallel transaction processing.',
            website: 'https://fuel.network',
            startDate: '2023-09-15',
            airdropDate: '2024-04-10',
            estimatedValue: 1900,
            requirements: [
                'Participate in testnet',
                'Test Fuel wallet',
                'Deploy Sway contracts'
            ],
            activities: [],
            tasks: [
                'Run Fuel node',
                'Write and deploy Sway contracts',
                'Participate in bug bounties'
            ]
        },
        {
            id: 'project-18',
            name: 'Eigenlayer',
            symbol: 'EIGEN',
            logo: 'fa-cubes',
            category: 'Staking',
            status: 'upcoming',
            description: 'Protocol that allows Ethereum stakers to reuse their ETH for securing other protocols.',
            website: 'https://eigenlayer.xyz',
            startDate: '2023-06-01',
            airdropDate: '2024-03-01',
            estimatedValue: 2300,
            requirements: [
                'Stake ETH in Eigenlayer',
                'Participate in testnet',
                'Validate actively'
            ],
            activities: [],
            tasks: [
                'Stake at least 5 ETH',
                'Run AVS node',
                'Participate in governance'
            ]
        },
        {
            id: 'project-19',
            name: 'Cosmos Hub',
            symbol: 'ATOM',
            logo: 'fa-atom',
            category: 'Interoperability',
            status: 'active',
            description: 'Interoperable blockchain ecosystem connecting multiple sovereign blockchains.',
            website: 'https://cosmos.network',
            startDate: '2022-04-15',
            airdropDate: '2023-12-05',
            estimatedValue: 2800,
            requirements: [
                'Stake ATOM',
                'Participate in governance',
                'Use IBC transfers'
            ],
            activities: [],
            tasks: [
                'Stake at least 10 ATOM',
                'Vote on governance proposals',
                'Use at least 5 IBC transfers'
            ]
        },
        {
            id: 'project-20',
            name: 'Polkadot',
            symbol: 'DOT',
            logo: 'fa-circle-notch',
            category: 'Interoperability',
            status: 'active',
            description: 'Multi-chain network enabling cross-blockchain transfers of any data or asset types.',
            website: 'https://polkadot.network',
            startDate: '2022-05-01',
            airdropDate: '2023-12-20',
            estimatedValue: 3200,
            requirements: [
                'Stake DOT',
                'Participate in parachain auctions',
                'Vote on governance'
            ],
            activities: [],
            tasks: [
                'Stake at least 50 DOT',
                'Contribute to crowdloans',
                'Nominate validators'
            ]
        },
        {
            id: 'project-21',
            name: 'Avalanche',
            symbol: 'AVAX',
            logo: 'fa-mountain',
            category: 'Layer 1',
            status: 'active',
            description: 'High-performance blockchain with fast finality and low transaction costs.',
            website: 'https://avax.network',
            startDate: '2022-03-05',
            airdropDate: '2023-11-25',
            estimatedValue: 2700,
            requirements: [
                'Hold AVAX tokens',
                'Stake AVAX',
                'Use Avalanche DeFi'
            ],
            activities: [],
            tasks: [
                'Stake at least 25 AVAX',
                'Bridge assets to Avalanche',
                'Provide liquidity on Avalanche DEXes'
            ]
        }
    ];
    
    // Initialize sample activities
    appData.activities = [
        {
            id: 'activity-1',
            type: 'investment',
            projectId: 'project-1',
            amount: 1200,
            date: '2023-05-15',
            notes: 'Initial investment in Ethereum 2.0'
        },
        {
            id: 'activity-2',
            type: 'task',
            projectId: 'project-2',
            task: 'Bridged assets to Arbitrum',
            date: '2023-05-18',
            completed: true
        },
        {
            id: 'activity-3',
            type: 'earning',
            projectId: 'project-3',
            amount: 350,
            date: '2023-05-20',
            notes: 'First airdrop reward from Optimism'
        }
    ];
    
    // Initialize investments
    appData.investments = [
        {
            id: 'investment-1',
            projectId: 'project-1',
            amount: 1200,
            date: '2023-05-15',
            notes: 'Initial investment in Ethereum 2.0'
        },
        {
            id: 'investment-2',
            projectId: 'project-2',
            amount: 800,
            date: '2023-05-16',
            notes: 'Bought ARB tokens'
        },
        {
            id: 'investment-3',
            projectId: 'project-4',
            amount: 1500,
            date: '2023-05-17',
            notes: 'Staked SOL tokens'
        }
    ];
    
    // Initialize earnings
    appData.earnings = [
        {
            id: 'earning-1',
            projectId: 'project-3',
            amount: 350,
            date: '2023-05-20',
            notes: 'First airdrop reward from Optimism'
        },
        {
            id: 'earning-2',
            projectId: 'project-1',
            amount: 480,
            date: '2023-05-22',
            notes: 'ETH staking rewards'
        }
    ];
    
    // Initialize tasks
    appData.tasks = [
        {
            id: 'task-1',
            type: 'daily',
            name: 'Check new airdrops',
            description: 'Check for any new airdrop announcements',
            dueDate: '2023-06-01',
            completed: false,
            projectId: null
        },
        {
            id: 'task-2',
            type: 'daily',
            name: 'Update portfolio tracking',
            description: 'Record any new investments or earnings',
            dueDate: '2023-06-01',
            completed: false,
            projectId: null
        },
        {
            id: 'task-3',
            type: 'project',
            name: 'Bridge ETH to Arbitrum',
            description: 'Transfer at least 0.5 ETH to Arbitrum network',
            dueDate: '2023-06-05',
            completed: true,
            projectId: 'project-2'
        },
        {
            id: 'task-4',
            type: 'project',
            name: 'Stake SOL tokens',
            description: 'Stake at least 10 SOL in validator',
            dueDate: '2023-06-10',
            completed: false,
            projectId: 'project-4'
        }
    ];
    
    // Initialize news
    appData.news = [
        {
            id: 'news-1',
            category: 'airdrop',
            title: 'Arbitrum Announces Major Airdrop',
            date: '2023-05-22',
            content: 'Arbitrum has announced a major airdrop for early users of their platform. Users who have interacted with the network before March 2023 will be eligible.',
            link: 'https://example.com/arbitrum-airdrop'
        },
        {
            id: 'news-2',
            category: 'project',
            title: 'Ethereum 2.0 Shapella Upgrade Successful',
            date: '2023-05-20',
            content: 'The Ethereum 2.0 Shapella upgrade has been successfully implemented, allowing stakers to withdraw their ETH and rewards.',
            link: 'https://example.com/ethereum-upgrade'
        },
        {
            id: 'news-3',
            category: 'market',
            title: 'Crypto Market Shows Signs of Recovery',
            date: '2023-05-18',
            content: 'The cryptocurrency market is showing signs of recovery after a prolonged bear market, with Bitcoin and Ethereum leading the way.',
            link: 'https://example.com/market-recovery'
        }
    ];
    
    // Save default data
    saveData();
}

// ==========================================
// CHART INITIALIZATION
// ==========================================
let portfolioChart, investmentDistributionChart, earningsChart, roiChart, 
    successRateChart, valueDistributionChart, monthlyPerformanceChart, taskHistoryChart;

function initCharts() {
    // Set chart defaults based on theme
    const textColor = document.body.classList.contains('light-theme') ? '#333333' : '#e0e6ff';
    const gridColor = document.body.classList.contains('light-theme') ? '#e1e8ff' : '#2a3245';
    
    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;
    
    // Initialize Portfolio Performance Chart
    initPortfolioChart();
    
    // Initialize Investment Distribution Chart
    initInvestmentDistributionChart();
    
    // Initialize Earnings Chart
    initEarningsChart();
    
    // Initialize ROI Chart
    initRoiChart();
    
    // Initialize Success Rate Chart
    initSuccessRateChart();
    
    // Initialize Value Distribution Chart
    initValueDistributionChart();
    
    // Initialize Monthly Performance Chart
    initMonthlyPerformanceChart();
    
    // Initialize Task History Chart
    initTaskHistoryChart();
}

function updateAllCharts() {
    // Update all charts with new theme colors
    destroyAllCharts();
    initCharts();
}

function destroyAllCharts() {
    // Destroy all chart instances to recreate them
    if (portfolioChart) portfolioChart.destroy();
    if (investmentDistributionChart) investmentDistributionChart.destroy();
    if (earningsChart) earningsChart.destroy();
    if (roiChart) roiChart.destroy();
    if (successRateChart) successRateChart.destroy();
    if (valueDistributionChart) valueDistributionChart.destroy();
    if (monthlyPerformanceChart) monthlyPerformanceChart.destroy();
    if (taskHistoryChart) taskHistoryChart.destroy();
}

function initPortfolioChart() {
    const ctx = document.getElementById('portfolio-chart').getContext('2d');
    
    // Get last 7 days of data
    const labels = getLast7Days();
    
    // Mock portfolio data
    const portfolioData = calculatePortfolioPerformance();
    
    portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Portfolio Value',
                data: portfolioData,
                borderColor: getComputedStyle(document.body).getPropertyValue('--primary'),
                backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary') + '33',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

function initInvestmentDistributionChart() {
    const ctx = document.getElementById('investment-distribution-chart').getContext('2d');
    
    // Get investment data by project
    const investmentData = calculateInvestmentDistribution();
    
    investmentDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: investmentData.labels,
            datasets: [{
                data: investmentData.values,
                backgroundColor: [
                    getComputedStyle(document.body).getPropertyValue('--chart-1'),
                    getComputedStyle(document.body).getPropertyValue('--chart-2'),
                    getComputedStyle(document.body).getPropertyValue('--chart-3'),
                    getComputedStyle(document.body).getPropertyValue('--chart-4'),
                    getComputedStyle(document.body).getPropertyValue('--chart-5')
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw;
                            const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: $${value} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

function initEarningsChart() {
    const ctx = document.getElementById('earnings-chart').getContext('2d');
    
    // Get earnings data by month
    const earningsData = calculateEarningsOverTime();
    
    earningsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: earningsData.labels,
            datasets: [{
                label: 'Earnings',
                data: earningsData.values,
                backgroundColor: getComputedStyle(document.body).getPropertyValue('--success'),
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '$' + context.raw;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

function initRoiChart() {
    const ctx = document.getElementById('roi-chart').getContext('2d');
    
    // Get ROI data over time
    const roiData = calculateRoiOverTime();
    
    roiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: roiData.labels,
            datasets: [{
                label: 'ROI %',
                data: roiData.values,
                borderColor: getComputedStyle(document.body).getPropertyValue('--primary'),
                backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary') + '33',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.raw + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function initSuccessRateChart() {
    const ctx = document.getElementById('success-rate-chart').getContext('2d');
    
    // Get project success rate data
    const successRateData = calculateProjectSuccessRate();
    
    successRateChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: successRateData.labels,
            datasets: [{
                data: successRateData.values,
                backgroundColor: [
                    getComputedStyle(document.body).getPropertyValue('--success'),
                    getComputedStyle(document.body).getPropertyValue('--error'),
                    getComputedStyle(document.body).getPropertyValue('--warning')
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw;
                            const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} projects (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function initValueDistributionChart() {
    const ctx = document.getElementById('value-distribution-chart').getContext('2d');
    
    // Get airdrop value distribution data
    const valueDistData = calculateValueDistribution();
    
    valueDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: valueDistData.labels,
            datasets: [{
                label: 'Number of Projects',
                data: valueDistData.values,
                backgroundColor: getComputedStyle(document.body).getPropertyValue('--accent'),
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function initMonthlyPerformanceChart() {
    const ctx = document.getElementById('monthly-performance-chart').getContext('2d');
    
    // Get monthly performance data
    const monthlyData = calculateMonthlyPerformance();
    
    monthlyPerformanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthlyData.labels,
            datasets: [
                {
                    label: 'Investments',
                    data: monthlyData.investments,
                    backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary'),
                    borderWidth: 0,
                    borderRadius: 4
                },
                {
                    label: 'Earnings',
                    data: monthlyData.earnings,
                    backgroundColor: getComputedStyle(document.body).getPropertyValue('--success'),
                    borderWidth: 0,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.raw;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

function initTaskHistoryChart() {
    const ctx = document.getElementById('task-history-chart').getContext('2d');
    
    // Get task completion history
    const taskHistoryData = calculateTaskCompletionHistory();
    
    taskHistoryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: taskHistoryData.labels,
            datasets: [
                {
                    label: 'Completed Tasks',
                    data: taskHistoryData.completed,
                    borderColor: getComputedStyle(document.body).getPropertyValue('--success'),
                    backgroundColor: getComputedStyle(document.body).getPropertyValue('--success') + '33',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Total Tasks',
                    data: taskHistoryData.total,
                    borderColor: getComputedStyle(document.body).getPropertyValue('--primary'),
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    borderDash: [5, 5],
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Chart Data Calculation Functions
function calculatePortfolioPerformance() {
    // Calculate portfolio value for the last 7 days
    // For this example, we'll create synthetic data based on investments and earnings
    
    const totalInvestment = appData.investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalEarnings = appData.earnings.reduce((sum, earn) => sum + earn.amount, 0);
    
    // Create some variation for the chart
    const baseValue = totalInvestment + totalEarnings;
    const dailyData = [];
    
    for (let i = 0; i < 7; i++) {
        // Generate some variation (-5% to +5%)
        const variation = baseValue * (Math.random() * 0.1 - 0.05);
        dailyData.push(Math.round(baseValue + variation));
    }
    
    return dailyData;
}

function calculateInvestmentDistribution() {
    // Calculate investment distribution by project
    const projectMap = new Map();
    
    // Sum investments by project
    appData.investments.forEach(inv => {
        const projectId = inv.projectId;
        const project = appData.projects.find(p => p.id === projectId);
        
        if (project) {
            const projectName = project.name;
            if (projectMap.has(projectName)) {
                projectMap.set(projectName, projectMap.get(projectName) + inv.amount);
            } else {
                projectMap.set(projectName, inv.amount);
            }
        }
    });
    
    // Convert to arrays for chart
    const labels = [];
    const values = [];
    
    // Sort by value in descending order
    const sortedProjects = [...projectMap.entries()].sort((a, b) => b[1] - a[1]);
    
    // Take top 5 and group the rest as "Others"
    if (sortedProjects.length > 5) {
        for (let i = 0; i < 5; i++) {
            if (i < sortedProjects.length) {
                labels.push(sortedProjects[i][0]);
                values.push(sortedProjects[i][1]);
            }
        }
        
        // Sum the rest as "Others"
        const othersValue = sortedProjects.slice(5).reduce((sum, proj) => sum + proj[1], 0);
        if (othersValue > 0) {
            labels.push('Others');
            values.push(othersValue);
        }
    } else {
        // Less than 5 projects, just use all of them
        sortedProjects.forEach(proj => {
            labels.push(proj[0]);
            values.push(proj[1]);
        });
    }
    
    return { labels, values };
}

function calculateEarningsOverTime() {
    // Calculate earnings over the last 6 months
    const months = getLast6Months();
    const values = new Array(months.length).fill(0);
    
    // Sum earnings by month
    appData.earnings.forEach(earn => {
        const earnDate = new Date(earn.date);
        const monthYear = earnDate.toLocaleString('default', { month: 'short', year: '2-digit' });
        
        const index = months.indexOf(monthYear);
        if (index !== -1) {
            values[index] += earn.amount;
        }
    });
    
    return { labels: months, values };
}

function calculateRoiOverTime() {
    // Calculate ROI over the last 6 months
    const months = getLast6Months();
    const values = [];
    
    // For each month, calculate cumulative investment and earnings up to that month
    for (let i = 0; i < months.length; i++) {
        const currentMonth = months[i];
        const [monthName, yearStr] = currentMonth.split(" ");
        
        // Get month number from name
        const monthNumber = new Date(Date.parse(`${monthName} 1, 20${yearStr}`)).getMonth();
        const year = 2000 + parseInt(yearStr);
        
        // Calculate cutoff date
        const cutoffDate = new Date(year, monthNumber + 1, 0); // Last day of the month
        
        // Sum investments and earnings up to this month
        let investmentSum = 0;
        let earningsSum = 0;
        
        appData.investments.forEach(inv => {
            const invDate = new Date(inv.date);
            if (invDate <= cutoffDate) {
                investmentSum += inv.amount;
            }
        });
        
        appData.earnings.forEach(earn => {
            const earnDate = new Date(earn.date);
            if (earnDate <= cutoffDate) {
                earningsSum += earn.amount;
            }
        });
        
        // Calculate ROI percentage
        const roi = investmentSum > 0 ? (earningsSum / investmentSum) * 100 : 0;
        values.push(Math.round(roi * 10) / 10); // Round to 1 decimal place
    }
    
    return { labels: months, values };
}

function calculateProjectSuccessRate() {
    // Calculate success rate of projects
    const statuses = ['active', 'upcoming', 'completed'];
    const statusCounts = {
        'active': 0,
        'upcoming': 0,
        'completed': 0
    };
    
    // Count projects by status
    appData.projects.forEach(project => {
        if (statuses.includes(project.status)) {
            statusCounts[project.status]++;
        }
    });
    
    // Format for chart
    const labels = ['Active', 'Upcoming', 'Completed'];
    const values = [statusCounts.active, statusCounts.upcoming, statusCounts.completed];
    
    return { labels, values };
}

function calculateValueDistribution() {
    // Calculate distribution of estimated airdrop values
    const valueRanges = [
        '< $1000',
        '$1000 - $2000',
        '$2000 - $3000',
        '$3000 - $4000',
        '$4000+'
    ];
    
    const valueCounts = [0, 0, 0, 0, 0];
    
    // Count projects by value range
    appData.projects.forEach(project => {
        const value = project.estimatedValue;
        
        if (value < 1000) {
            valueCounts[0]++;
        } else if (value < 2000) {
            valueCounts[1]++;
        } else if (value < 3000) {
            valueCounts[2]++;
        } else if (value < 4000) {
            valueCounts[3]++;
        } else {
            valueCounts[4]++;
        }
    });
    
    return { labels: valueRanges, values: valueCounts };
}

function calculateMonthlyPerformance() {
    // Calculate investments and earnings by month for the last 6 months
    const months = getLast6Months();
    const investments = new Array(months.length).fill(0);
    const earnings = new Array(months.length).fill(0);
    
    // Sum investments by month
    appData.investments.forEach(inv => {
        const invDate = new Date(inv.date);
        const monthYear = invDate.toLocaleString('default', { month: 'short', year: '2-digit' });
        
        const index = months.indexOf(monthYear);
        if (index !== -1) {
            investments[index] += inv.amount;
        }
    });
    
    // Sum earnings by month
    appData.earnings.forEach(earn => {
        const earnDate = new Date(earn.date);
        const monthYear = earnDate.toLocaleString('default', { month: 'short', year: '2-digit' });
        
        const index = months.indexOf(monthYear);
        if (index !== -1) {
            earnings[index] += earn.amount;
        }
    });
    
    return { labels: months, investments, earnings };
}

function calculateTaskCompletionHistory() {
    // Calculate task completion history for the last 7 days
    const days = getLast7Days();
    const completed = new Array(days.length).fill(0);
    const total = new Array(days.length).fill(0);
    
    // This would normally use actual historical data
    // For this example, we'll generate some synthetic data
    
    const completionRate = appData.tasks.filter(task => task.completed).length / appData.tasks.length;
    
    for (let i = 0; i < days.length; i++) {
        // Generate synthetic data based on current completion rate
        const dayTasks = Math.floor(Math.random() * 5) + 3; // 3-7 tasks per day
        total[i] = dayTasks;
        completed[i] = Math.round(dayTasks * (completionRate + (Math.random() * 0.3 - 0.15)));
        
        // Ensure completed doesn't exceed total
        completed[i] = Math.min(completed[i], total[i]);
    }
    
    return { labels: days, completed, total };
}

// Helper functions for date calculations
function getLast7Days() {
    const labels = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleString('default', { month: 'short', day: 'numeric' }));
    }
    return labels;
}

function getLast6Months() {
    const labels = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        labels.push(date.toLocaleString('default', { month: 'short', year: '2-digit' }));
    }
    
    return labels;
}

// ==========================================
// EVENT HANDLERS
// ==========================================
function initEventHandlers() {
    // Search and filter for explore section
    document.getElementById('project-search').addEventListener('input', filterProjects);
    document.getElementById('project-filter').addEventListener('change', filterProjects);
    
    // Search and filter for investments
    document.getElementById('investment-search').addEventListener('input', filterInvestments);
    document.getElementById('investment-filter').addEventListener('change', filterInvestments);
    
    // Search and filter for news
    document.getElementById('news-search').addEventListener('input', filterNews);
    document.getElementById('news-filter').addEventListener('change', filterNews);
    
    // Sort projects
    document.getElementById('sort-projects-btn').addEventListener('click', toggleProjectSort);
}

function filterProjects() {
    const searchTerm = document.getElementById('project-search').value.toLowerCase();
    const filterValue = document.getElementById('project-filter').value;
    
    const projectGrid = document.getElementById('project-grid');
    
    // Clear existing projects
    projectGrid.innerHTML = '';
    
    // Filter projects
    const filteredProjects = appData.projects.filter(project => {
        const matchesSearch = 
            project.name.toLowerCase().includes(searchTerm) || 
            project.category.toLowerCase().includes(searchTerm) ||
            project.description.toLowerCase().includes(searchTerm);
        
        const matchesFilter = 
            filterValue === 'all' || 
            project.status === filterValue;
        
        return matchesSearch && matchesFilter;
    });
    
    if (filteredProjects.length === 0) {
        projectGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-info-circle"></i>
                <p>No projects found matching your criteria</p>
            </div>
        `;
        return;
    }
    
    // Display filtered projects
    filteredProjects.forEach(project => {
        projectGrid.appendChild(createProjectCard(project));
    });
}

function filterInvestments() {
    const searchTerm = document.getElementById('investment-search').value.toLowerCase();
    const filterValue = document.getElementById('investment-filter').value;
    
    const investmentHistory = document.getElementById('investment-history');
    
    // Clear existing items
    investmentHistory.innerHTML = '';
    
    // Get all transactions (investments and earnings)
    let transactions = [];
    
    if (filterValue === 'all' || filterValue === 'investment') {
        transactions = transactions.concat(appData.investments.map(inv => ({...inv, type: 'investment'})));
    }
    
    if (filterValue === 'all' || filterValue === 'earning') {
        transactions = transactions.concat(appData.earnings.map(earn => ({...earn, type: 'earning'})));
    }
    
    // Filter by search term
    const filteredTransactions = transactions.filter(trans => {
        const project = appData.projects.find(p => p.id === trans.projectId);
        if (!project) return false;
        
        return project.name.toLowerCase().includes(searchTerm) || 
               (trans.notes && trans.notes.toLowerCase().includes(searchTerm));
    });
    
    // Sort by date (most recent first)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredTransactions.length === 0) {
        investmentHistory.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-info-circle"></i>
                <p>No transactions found matching your criteria</p>
            </div>
        `;
        return;
    }
    
    // Display filtered transactions
    filteredTransactions.forEach(trans => {
        investmentHistory.appendChild(createTransactionItem(trans));
    });
}

function filterNews() {
    const searchTerm = document.getElementById('news-search').value.toLowerCase();
    const filterValue = document.getElementById('news-filter').value;
    
    const newsGrid = document.getElementById('news-grid');
    
    // Clear existing news
    newsGrid.innerHTML = '';
    
    // Filter news
    const filteredNews = appData.news.filter(news => {
        const matchesSearch = 
            news.title.toLowerCase().includes(searchTerm) || 
            news.content.toLowerCase().includes(searchTerm);
        
        const matchesFilter = 
            filterValue === 'all' || 
            news.category === filterValue.slice(0, -1); // Remove 's' from end (projects -> project)
        
        return matchesSearch && matchesFilter;
    });
    
    if (filteredNews.length === 0) {
        newsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-info-circle"></i>
                <p>No news found matching your criteria</p>
            </div>
        `;
        return;
    }
    
    // Display filtered news
    filteredNews.forEach(news => {
        newsGrid.appendChild(createNewsCard(news));
    });
}

let currentSortOrder = 'name-asc';

function toggleProjectSort() {
    const projectGrid = document.getElementById('project-grid');
    const projects = Array.from(projectGrid.querySelectorAll('.project-card'));
    
    if (projects.length === 0) return;
    
    // Update sort order
    switch(currentSortOrder) {
        case 'name-asc':
            currentSortOrder = 'name-desc';
            break;
        case 'name-desc':
            currentSortOrder = 'value-desc';
            break;
        case 'value-desc':
            currentSortOrder = 'value-asc';
            break;
        case 'value-asc':
            currentSortOrder = 'date-asc';
            break;
        case 'date-asc':
            currentSortOrder = 'date-desc';
            break;
        case 'date-desc':
            currentSortOrder = 'name-asc';
            break;
        default:
            currentSortOrder = 'name-asc';
    }
    
    // Sort projects
    projects.sort((a, b) => {
        const projectIdA = a.getAttribute('data-project-id');
        const projectIdB = b.getAttribute('data-project-id');
        
        const projectA = appData.projects.find(p => p.id === projectIdA);
        const projectB = appData.projects.find(p => p.id === projectIdB);
        
        if (!projectA || !projectB) return 0;
        
        switch(currentSortOrder) {
            case 'name-asc':
                return projectA.name.localeCompare(projectB.name);
            case 'name-desc':
                return projectB.name.localeCompare(projectA.name);
            case 'value-desc':
                return projectB.estimatedValue - projectA.estimatedValue;
            case 'value-asc':
                return projectA.estimatedValue - projectB.estimatedValue;
            case 'date-asc':
                return new Date(projectA.airdropDate) - new Date(projectB.airdropDate);
            case 'date-desc':
                return new Date(projectB.airdropDate) - new Date(projectA.airdropDate);
            default:
                return 0;
        }
    });
    
    // Clear grid and append sorted projects
    projectGrid.innerHTML = '';
    projects.forEach(project => {
        projectGrid.appendChild(project);
    });
    
    // Update sort button text
    const sortBtn = document.getElementById('sort-projects-btn');
    let sortText = 'Sort';
    
    switch(currentSortOrder) {
        case 'name-asc':
            sortText = 'Sort: Name (A-Z)';
            break;
        case 'name-desc':
            sortText = 'Sort: Name (Z-A)';
            break;
        case 'value-desc':
            sortText = 'Sort: Value (High-Low)';
            break;
        case 'value-asc':
            sortText = 'Sort: Value (Low-High)';
            break;
        case 'date-asc':
            sortText = 'Sort: Date (Earliest)';
            break;
        case 'date-desc':
            sortText = 'Sort: Date (Latest)';
            break;
    }
    
    sortBtn.innerHTML = `<i class="fas fa-sort"></i> ${sortText}`;
}

// ==========================================
// FORM HANDLERS
// ==========================================
function handleInvestmentFormSubmit(e) {
    e.preventDefault();
    
    const type = document.getElementById('transaction-type').value;
    const projectId = document.getElementById('project-select').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const date = document.getElementById('transaction-date').value;
    const notes = document.getElementById('transaction-notes').value;
    
    if (!projectId || isNaN(amount) || amount <= 0 || !date) {
        alert('Please fill in all required fields with valid values.');
        return;
    }
    
    // Generate unique ID
    const id = type + '-' + Date.now();
    
    const transaction = {
        id,
        projectId,
        amount,
        date,
        notes
    };
    
    // Add to appropriate array
    if (type === 'investment') {
        appData.investments.push(transaction);
    } else {
        appData.earnings.push(transaction);
    }
    
    // Add to activities
    const activity = {
        id: 'activity-' + Date.now(),
        type,
        projectId,
        amount,
        date,
        notes
    };
    
    appData.activities.unshift(activity);
    
    // Save data
    saveData();
    
    // Update UI
    updateUI();
    
    // Close modal
    closeModal('add-investment-modal');
}

function handleTaskFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('task-name').value;
    const type = document.getElementById('task-type').value;
    const projectId = type === 'project' ? document.getElementById('task-project').value : null;
    const dueDate = document.getElementById('task-due-date').value;
    const description = document.getElementById('task-description').value;
    
    if (!name || !type || (type === 'project' && !projectId)) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Generate unique ID
    const id = 'task-' + Date.now();
    
    const task = {
        id,
        type,
        name,
        description,
        dueDate,
        completed: false,
        projectId
    };
    
    // Add to tasks
    appData.tasks.push(task);
    
    // Add to activities
    const activity = {
        id: 'activity-' + Date.now(),
        type: 'task',
        projectId,
        task: name,
        date: new Date().toISOString().split('T')[0],
        completed: false
    };
    
    appData.activities.unshift(activity);
    
    // Save data
    saveData();
    
    // Update UI
    updateUI();
    
    // Close modal
    closeModal('add-task-modal');
}

// ==========================================
// UI UPDATES
// ==========================================
function updateUI() {
    // Update dashboard summary
    updateDashboardSummary();
    
    // Update activity list
    updateActivityList();
    
    // Update upcoming airdrops
    updateUpcomingAirdrops();
    
    // Update investment summary
    updateInvestmentSummary();
    
    // Update investment history
    updateInvestmentHistory();
    
    // Update project grid
    updateProjectGrid();
    
    // Update task lists
    updateTaskLists();
    
    // Update news grid
    updateNewsGrid();
    
    // Update charts
    updateAllCharts();
}

function updateDashboardSummary() {
    // Calculate totals
    const totalInvestment = appData.investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalEarnings = appData.earnings.reduce((sum, earn) => sum + earn.amount, 0);
    const activeProjects = appData.projects.filter(p => p.status === 'active').length;
    const pendingAirdrops = appData.projects.filter(p => {
        const dropDate = new Date(p.airdropDate);
        const today = new Date();
        return dropDate > today;
    }).length;
    
    // Update UI
    document.getElementById('total-investment').textContent = formatCurrency(totalInvestment);
    document.getElementById('total-earnings').textContent = formatCurrency(totalEarnings);
    document.getElementById('active-projects').textContent = activeProjects;
    document.getElementById('pending-airdrops').textContent = pendingAirdrops;
    
    // Calculate change percentages (in a real app, this would compare to previous period)
    // For this example, we'll use mock values
    document.getElementById('investment-change').textContent = '12%';
    document.getElementById('earnings-change').textContent = '8%';
    document.getElementById('pending-change').textContent = '5%';
}

function updateActivityList() {
    const activityList = document.getElementById('activity-list');
    
    // Clear existing items
    activityList.innerHTML = '';
    
    // Get most recent activities (up to 5)
    const recentActivities = appData.activities.slice(0, 5);
    
    if (recentActivities.length === 0) {
        activityList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-info-circle"></i>
                <p>No recent activity to display</p>
            </div>
        `;
        return;
    }
    
    // Create activity items
    recentActivities.forEach(activity => {
        activityList.appendChild(createActivityItem(activity));
    });
}

function updateUpcomingAirdrops() {
    const upcomingList = document.getElementById('upcoming-list');
    
    // Clear existing items
    upcomingList.innerHTML = '';
    
    // Get upcoming airdrops (sorted by date)
    const today = new Date();
    const upcomingAirdrops = appData.projects
        .filter(p => new Date(p.airdropDate) > today)
        .sort((a, b) => new Date(a.airdropDate) - new Date(b.airdropDate))
        .slice(0, 5);
    
    if (upcomingAirdrops.length === 0) {
        upcomingList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-info-circle"></i>
                <p>No upcoming airdrops to display</p>
            </div>
        `;
        return;
    }
    
    // Create upcoming items
    upcomingAirdrops.forEach(project => {
        upcomingList.appendChild(createUpcomingItem(project));
    });
}

function updateInvestmentSummary() {
    const totalInvested = appData.investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalEarned = appData.earnings.reduce((sum, earn) => sum + earn.amount, 0);
    const roi = totalInvested > 0 ? (totalEarned / totalInvested) * 100 : 0;
    
    document.getElementById('inv-total-invested').textContent = formatCurrency(totalInvested);
    document.getElementById('inv-total-earned').textContent = formatCurrency(totalEarned);
    document.getElementById('inv-roi').textContent = `${roi.toFixed(2)}%`;
}

function updateInvestmentHistory() {
    const investmentHistory = document.getElementById('investment-history');
    
    // Clear existing items
    investmentHistory.innerHTML = '';
    
    // Get all transactions (investments and earnings)
    const transactions = [
        ...appData.investments.map(inv => ({...inv, type: 'investment'})),
        ...appData.earnings.map(earn => ({...earn, type: 'earning'}))
    ];
    
    // Sort by date (most recent first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (transactions.length === 0) {
        investmentHistory.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-info-circle"></i>
                <p>No investment history to display</p>
            </div>
        `;
        return;
    }
    
    // Create transaction items
    transactions.forEach(transaction => {
        investmentHistory.appendChild(createTransactionItem(transaction));
    });
}

function updateProjectGrid() {
    const projectGrid = document.getElementById('project-grid');
    
    // Clear existing items
    projectGrid.innerHTML = '';
    
    if (appData.projects.length === 0) {
        projectGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-info-circle"></i>
                <p>No projects to display</p>
            </div>
        `;
        return;
    }
    
    // Create project cards
    appData.projects.forEach(project => {
        projectGrid.appendChild(createProjectCard(project));
    });
}

function updateTaskLists() {
    const dailyTasksList = document.getElementById('daily-tasks');
    const projectTasksList = document.getElementById('project-tasks');
    
    // Clear existing items
    dailyTasksList.innerHTML = '';
    projectTasksList.innerHTML = '';
    
    // Filter tasks
    const dailyTasks = appData.tasks.filter(task => task.type === 'daily');
    const projectTasks = appData.tasks.filter(task => task.type === 'project');
    
    // Update task summary
    const totalTasks = appData.tasks.length;
    const completedTasks = appData.tasks.filter(task => task.completed).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    document.getElementById('total-tasks').textContent = totalTasks;
    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('task-completion-rate').textContent = `${completionRate.toFixed(0)}%`;
    
    // Display daily tasks
    if (dailyTasks.length === 0) {
        dailyTasksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-info-circle"></i>
                <p>No daily tasks to display</p>
            </div>
        `;
    } else {
        dailyTasks.forEach(task => {
            dailyTasksList.appendChild(createTaskItem(task));
        });
    }
    
    // Display project tasks
    if (projectTasks.length === 0) {
        projectTasksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-info-circle"></i>
                <p>No project tasks to display</p>
            </div>
        `;
    } else {
        projectTasks.forEach(task => {
            projectTasksList.appendChild(createTaskItem(task));
        });
    }
}

function updateNewsGrid() {
    const newsGrid = document.getElementById('news-grid');
    
    // Clear existing items
    newsGrid.innerHTML = '';
    
    if (appData.news.length === 0) {
        newsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-info-circle"></i>
                <p>No news to display</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (most recent first)
    const sortedNews = [...appData.news].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Create news cards
    sortedNews.forEach(news => {
        newsGrid.appendChild(createNewsCard(news));
    });
}

// ==========================================
// UI ELEMENT CREATION
// ==========================================
function createActivityItem(activity) {
    const item = document.createElement('div');
    item.className = 'activity-item';
    
    const project = appData.projects.find(p => p.id === activity.projectId);
    const projectName = project ? project.name : 'Unknown Project';
    
    let iconClass, activityText;
    
    if (activity.type === 'investment') {
        iconClass = 'fa-arrow-up';
        activityText = `Invested in ${projectName}`;
    } else if (activity.type === 'earning') {
        iconClass = 'fa-arrow-down';
        activityText = `Earned from ${projectName}`;
    } else if (activity.type === 'task') {
        iconClass = 'fa-check';
        activityText = activity.completed 
            ? `Completed task: ${activity.task}`
            : `Added task: ${activity.task}`;
    }
    
    item.innerHTML = `
        <div class="activity-icon">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="activity-details">
            <div class="activity-project">${activityText}</div>
            <div class="activity-date">${formatDate(activity.date)}</div>
        </div>
        ${activity.amount ? `<div class="activity-amount">${formatCurrency(activity.amount)}</div>` : ''}
    `;
    
    return item;
}

function createUpcomingItem(project) {
    const item = document.createElement('div');
    item.className = 'upcoming-item';
    
    const daysUntil = getDaysUntil(project.airdropDate);
    
    item.innerHTML = `
        <div class="upcoming-icon">
            <i class="fas ${project.logo}"></i>
        </div>
        <div class="upcoming-details">
            <div class="upcoming-project">${project.name}</div>
            <div class="upcoming-date">Airdrop in ${daysUntil} days</div>
        </div>
        <div class="upcoming-value">${formatCurrency(project.estimatedValue)}</div>
    `;
    
    return item;
}

function createTransactionItem(transaction) {
    const item = document.createElement('div');
    item.className = 'investment-item';
    
    const project = appData.projects.find(p => p.id === transaction.projectId);
    const projectName = project ? project.name : 'Unknown Project';
    
    item.innerHTML = `
        <div class="investment-info">
            <div class="investment-project">${projectName}</div>
            <div class="investment-date">${formatDate(transaction.date)}</div>
            ${transaction.notes ? `<div class="investment-notes">${transaction.notes}</div>` : ''}
        </div>
        <div class="investment-amount ${transaction.type === 'earning' ? 'positive' : ''}">${transaction.type === 'earning' ? '+' : '-'}${formatCurrency(transaction.amount)}</div>
    `;
    
    return item;
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = `project-card ${project.status}`;
    card.setAttribute('data-project-id', project.id);
    
    const statusText = project.status.charAt(0).toUpperCase() + project.status.slice(1);
    
    card.innerHTML = `
        <div class="project-card-header">
            <div class="project-logo">
                <i class="fas ${project.logo}"></i>
            </div>
            <div class="project-status status-${project.status}">${statusText}</div>
        </div>
        <div class="project-card-body">
            <h3 class="project-name">${project.name}</h3>
            <div class="project-category">${project.category}</div>
            <p class="project-description">${project.description}</p>
            <div class="project-meta">
                <div class="project-date">Drop: ${formatDate(project.airdropDate)}</div>
                <div class="project-value">Est: ${formatCurrency(project.estimatedValue)}</div>
            </div>
        </div>
    `;
    
    // Add click event to show project details
    card.addEventListener('click', () => {
        showProjectDetails(project);
    });
    
    return card;
}

function createTaskItem(task) {
    const item = document.createElement('div');
    item.className = `task-item ${task.completed ? 'completed' : ''}`;
    item.setAttribute('data-task-id', task.id);
    
    // Check if task is overdue
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
    
    let projectName = '';
    if (task.projectId) {
        const project = appData.projects.find(p => p.id === task.projectId);
        if (project) {
            projectName = project.name;
        }
    }
    
    item.innerHTML = `
        <div class="task-checkbox ${task.completed ? 'checked' : ''}">
            ${task.completed ? '<i class="fas fa-check"></i>' : ''}
        </div>
        <div class="task-details">
            <div class="task-name">${task.name}</div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            ${projectName ? `<div class="task-project">Project: ${projectName}</div>` : ''}
        </div>
        ${task.dueDate ? `<div class="task-due-date ${isOverdue ? 'overdue' : ''}">${isOverdue ? 'Overdue' : formatDate(task.dueDate)}</div>` : ''}
    `;
    
    // Add click event to toggle task completion
    const checkbox = item.querySelector('.task-checkbox');
    checkbox.addEventListener('click', () => {
        toggleTaskCompletion(task.id);
    });
    
    return item;
}

function createNewsCard(news) {
    const card = document.createElement('div');
    card.className = `news-card ${news.category}`;
    
    const categoryText = news.category.charAt(0).toUpperCase() + news.category.slice(1);
    
    card.innerHTML = `
        <div class="news-header">
            <div class="news-category category-${news.category}">${categoryText}</div>
            <h3 class="news-title">${news.title}</h3>
            <div class="news-date">${formatDate(news.date)}</div>
        </div>
        <div class="news-body">
            <p class="news-content">${news.content}</p>
            <a href="${news.link}" class="news-link" target="_blank">Read more <i class="fas fa-external-link-alt"></i></a>
        </div>
    `;
    
    return card;
}

function showProjectDetails(project) {
    // Show project details section
    showSection('project-details-section');
    updateActiveNavItem(document.querySelector('.nav-item[data-section="explore-section"]'));
    
    const container = document.getElementById('project-details-container');
    
    // Format project status
    const statusText = project.status.charAt(0).toUpperCase() + project.status.slice(1);
    
    // Create project details HTML
    let html = `
        <div class="project-details-header">
            <div class="project-details-logo">
                <i class="fas ${project.logo}"></i>
            </div>
            <div class="project-details-title">
                <h3>${project.name} (${project.symbol})</h3>
                <div class="project-details-category">${project.category}</div>
            </div>
            <div class="project-details-status status-${project.status}">${statusText}</div>
        </div>
        <div class="project-details-body">
            <div class="project-details-info">
                <div class="info-item">
                    <span>Est. Value</span>
                    <strong>${formatCurrency(project.estimatedValue)}</strong>
                </div>
                <div class="info-item">
                    <span>Start Date</span>
                    <strong>${formatDate(project.startDate)}</strong>
                </div>
                <div class="info-item">
                    <span>Airdrop Date</span>
                    <strong>${formatDate(project.airdropDate)}</strong>
                </div>
                <div class="info-item">
                    <span>Days Until Airdrop</span>
                    <strong>${getDaysUntil(project.airdropDate)}</strong>
                </div>
            </div>
            
            <div class="project-details-description">
                <h4>Description</h4>
                <p>${project.description}</p>
                <p><a href="${project.website}" target="_blank" class="news-link">Visit Website <i class="fas fa-external-link-alt"></i></a></p>
            </div>
            
            <div class="project-details-requirements">
                <h4>Requirements</h4>
                <ul class="requirements-list">
    `;
    
    // Add requirements
    project.requirements.forEach(req => {
        html += `<li><i class="fas fa-check-circle"></i> ${req}</li>`;
    });
    
    html += `
                </ul>
            </div>
            
            <div class="project-details-tasks">
                <h4>Tasks to Complete</h4>
                <ul class="requirements-list">
    `;
    
    // Add tasks
    project.tasks.forEach(task => {
        html += `<li><i class="fas fa-tasks"></i> ${task}</li>`;
    });
    
    html += `
                </ul>
            </div>
    `;
    
    // Add activities if there are any
    if (project.activities && project.activities.length > 0) {
        html += `
            <div class="project-details-activities">
                <h4>Activity History</h4>
                <div class="activities-timeline">
        `;
        
        // Sort activities by date (most recent first)
        const sortedActivities = [...project.activities].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedActivities.forEach(activity => {
            html += `
                <div class="timeline-item">
                    <div class="timeline-date">${formatDate(activity.date)}</div>
                    <div class="timeline-title">${activity.title}</div>
                    <div class="timeline-description">${activity.description}</div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    html += `</div>`;
    
    container.innerHTML = html;
}

function toggleTaskCompletion(taskId) {
    // Find the task
    const taskIndex = appData.tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        // Toggle completion status
        appData.tasks[taskIndex].completed = !appData.tasks[taskIndex].completed;
        
        // Add activity if task is completed
        if (appData.tasks[taskIndex].completed) {
            const task = appData.tasks[taskIndex];
            
            const activity = {
                id: 'activity-' + Date.now(),
                type: 'task',
                projectId: task.projectId,
                task: task.name,
                date: new Date().toISOString().split('T')[0],
                completed: true
            };
            
            appData.activities.unshift(activity);
        }
        
        // Save data
        saveData();
        
        // Update UI
        updateUI();
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function getDaysUntil(dateString) {
    const targetDate = new Date(dateString);
    const today = new Date();
    
    // Reset time part for accurate day difference
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
}

function checkDailyTasksReset() {
    const lastReset = localStorage.getItem('lastTaskReset');
    const today = new Date().toDateString();
    
    if (lastReset !== today) {
        // Reset daily tasks
        appData.tasks.forEach(task => {
            if (task.type === 'daily') {
                task.completed = false;
            }
        });
        
        // Save data
        saveData();
        
        // Update last reset date
        localStorage.setItem('lastTaskReset', today);
    }
}
