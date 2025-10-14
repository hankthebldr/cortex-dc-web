'use client';

/**
 * Command Alignment Guide Component
 * Migrated from henryreed.ai/hosting/components/CommandAlignmentGuide.tsx
 *
 * Features:
 * - Terminal to GUI command mapping reference
 * - Categorical command organization
 * - Design principles documentation
 * - User benefit explanations
 * - Comprehensive command coverage
 */

import React from 'react';

export interface CommandMapping {
  terminal: string;
  gui: string;
  description: string;
}

export interface CommandCategory {
  category: string;
  commands: CommandMapping[];
}

export interface CommandAlignmentGuideProps {
  /** Custom command mappings to display */
  customMappings?: CommandCategory[];
  /** Additional CSS classes */
  className?: string;
}

const defaultCommandMappings: CommandCategory[] = [
  {
    category: "🎯 POV Management",
    commands: [
      {
        terminal: "pov create --interactive",
        gui: "Dashboard → New POV Button",
        description: "Create a new Proof of Value project"
      },
      {
        terminal: "pov list --active",
        gui: "Dashboard → Active POVs Card (clickable)",
        description: "List active POV projects"
      },
      {
        terminal: "pov report --current --executive",
        gui: "Dashboard → Generate Report Button",
        description: "Generate executive POV report"
      },
      {
        terminal: "pov --badass-blueprint",
        gui: "Dashboard → Badass Blueprint Button",
        description: "Create transformation blueprint PDF"
      }
    ]
  },
  {
    category: "📋 TRR Management",
    commands: [
      {
        terminal: "trr list",
        gui: "TRR → List TRRs Button",
        description: "List all Technical Requirements Reviews"
      },
      {
        terminal: "trr create --interactive",
        gui: "TRR → Create New TRR Button",
        description: "Create new TRR validation"
      },
      {
        terminal: "trr import --file sample.csv",
        gui: "TRR → Import CSV Button",
        description: "Import TRR data from CSV file"
      },
      {
        terminal: "trr validate --all --status pending",
        gui: "TRR → Validate Button",
        description: "Validate pending TRRs"
      },
      {
        terminal: "trr export --format csv",
        gui: "TRR → Export Button",
        description: "Export TRR data as CSV"
      },
      {
        terminal: "trr-signoff create --batch",
        gui: "TRR → Blockchain Batch Signoff",
        description: "Create blockchain signature for TRRs"
      }
    ]
  },
  {
    category: "🔬 Scenario Management",
    commands: [
      {
        terminal: "scenario list",
        gui: "Dashboard → List Scenarios Button",
        description: "Browse available security scenarios"
      },
      {
        terminal: "scenario generate --scenario-type cloud-posture",
        gui: "Dashboard → Deploy Scenario Button",
        description: "Deploy security scenario"
      },
      {
        terminal: "scenario status [id]",
        gui: "Dashboard → Scenario Status Cards",
        description: "Check deployment status"
      },
      {
        terminal: "scenario validate [id]",
        gui: "Scenarios → Validate Button",
        description: "Validate scenario deployment"
      },
      {
        terminal: "scenario export [id]",
        gui: "Scenarios → Export Results",
        description: "Export scenario results"
      }
    ]
  },
  {
    category: "🤖 AI & Analysis",
    commands: [
      {
        terminal: "ai \"help with POV optimization\"",
        gui: "AI → Quick AI Query Button",
        description: "Quick AI assistance query"
      },
      {
        terminal: "gemini analyze --context dashboard",
        gui: "AI → Run Analysis Button",
        description: "Run comprehensive AI analysis"
      },
      {
        terminal: "gemini predict --timeline --risks",
        gui: "AI → Predictive Insights",
        description: "Generate timeline and risk predictions"
      },
      {
        terminal: "gemini generate --executive-summary",
        gui: "AI → Generate Executive Summary",
        description: "Create AI-generated executive summary"
      }
    ]
  },
  {
    category: "🛠️ Content Creator",
    commands: [
      {
        terminal: "pov init --template executive-overview",
        gui: "Creator → Quick POV Setup",
        description: "Initialize POV with template"
      },
      {
        terminal: "template clone --base ransomware-detection",
        gui: "Creator → Clone Template",
        description: "Clone existing template"
      },
      {
        terminal: "scenario generate --type cloud-posture --mitre-guided",
        gui: "Creator → MITRE-Guided Scenario",
        description: "Create MITRE-mapped scenario"
      },
      {
        terminal: "content import --source csv",
        gui: "Creator → Import CSV",
        description: "Import content from CSV"
      },
      {
        terminal: "content export --format json --all",
        gui: "Creator → Export All",
        description: "Export all content as JSON"
      }
    ]
  },
  {
    category: "🔗 System & Integration",
    commands: [
      {
        terminal: "help",
        gui: "All Tabs → View All Commands",
        description: "Show available commands"
      },
      {
        terminal: "getting-started",
        gui: "All Tabs → Getting Started Guide",
        description: "Show introduction and guide"
      },
      {
        terminal: "status --analytics",
        gui: "Dashboard → Refresh Data",
        description: "Refresh system data and analytics"
      },
      {
        terminal: "clear",
        gui: "Terminal → Switch to GUI Mode",
        description: "Clear terminal or switch interface"
      }
    ]
  }
];

export const CommandAlignmentGuide: React.FC<CommandAlignmentGuideProps> = ({
  customMappings,
  className = ''
}) => {
  const commandMappings = customMappings || defaultCommandMappings;

  return (
    <div className={`bg-black text-white min-h-screen p-6 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-4">🔄 Terminal ↔ GUI Command Alignment</h1>
          <p className="text-gray-400">
            Consistent user experience across terminal and graphical interfaces
          </p>
        </div>

        <div className="space-y-8">
          {commandMappings.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-cyan-400 mb-6">{category.category}</h2>

              <div className="space-y-4">
                {category.commands.map((mapping, commandIndex) => (
                  <div key={commandIndex} className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-gray-800 rounded border border-gray-600">
                    <div className="space-y-2">
                      <div className="text-sm font-bold text-green-400">Terminal Command</div>
                      <div className="font-mono text-cyan-400 bg-black p-2 rounded text-sm">
                        {mapping.terminal}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-bold text-green-400">GUI Action</div>
                      <div className="text-blue-400 bg-blue-900/20 p-2 rounded text-sm">
                        {mapping.gui}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-bold text-green-400">Description</div>
                      <div className="text-gray-400 text-sm">
                        {mapping.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">🎯 Design Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-green-400 mb-3">Consistency Goals</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Same commands trigger identical backend operations</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Buttons are ordered to match terminal command flow</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>GUI buttons execute exact terminal commands</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Same user workflows across both interfaces</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-green-400 mb-3">User Benefits</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-0.5">💡</span>
                  <span>Learn once, use everywhere approach</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-0.5">💡</span>
                  <span>Seamless switching between interfaces</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-0.5">💡</span>
                  <span>Consistent muscle memory and workflows</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-0.5">💡</span>
                  <span>Enhanced productivity and reduced learning curve</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>This alignment ensures domain consultants have a consistent experience whether they prefer CLI or GUI workflows.</p>
        </div>
      </div>
    </div>
  );
};

export default CommandAlignmentGuide;
