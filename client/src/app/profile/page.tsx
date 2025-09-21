import React from 'react';
import { Camera, Briefcase, Users, MapPin, Mail, Plus, ExternalLink } from 'lucide-react';

const ProfilePage = () => {
  const projects = [
    { id: '123123', name: '123123', date: 'September 16, 2025' },
    { id: 'aetgser', name: 'aetgser', date: 'September 7, 2025' },
    { id: '123123-2', name: '123123', date: 'September 7, 2025' },
    { id: '123123-3', name: '123123', date: 'September 7, 2025' },
    { id: '123123-4', name: '123123', date: 'September 7, 2025' },
  ];

  const workplaces = [
    { name: 'Project', platform: 'Jira', icon: '🔷' },
    { name: '(Learn) Jira Premium benefits in 5 min', platform: 'Jira', icon: '🔷', badge: '⚡' }
  ];

  return (
    <div className="max-w-6xl mx-auto bg-white min-h-screen">
      {/* Header Cover */}
      <div className="relative h-48 bg-gray-400 rounded-t-lg">
        <button className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-black/20 text-white rounded-md hover:bg-black/30 transition-colors">
          <Camera size={16} />
          Add cover image
        </button>
      </div>

      <div className="flex gap-8 px-6 pb-6">
        {/* Left Sidebar */}
        <div className="w-80 -mt-16 relative">
          {/* Profile Avatar */}
          <div className="w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 border-4 border-white shadow-lg">
            BK
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Bành Tuấn Kiệt</h1>
          
          <button className="text-blue-600 hover:text-blue-700 text-sm mb-8">
            Manage your account
          </button>

          {/* About Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Briefcase size={16} />
                <span className="text-sm">Your job title</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Users size={16} />
                <span className="text-sm">Your department</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Briefcase size={16} />
                <span className="text-sm">Your organization</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin size={16} />
                <span className="text-sm">Your location</span>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
            <div className="flex items-center gap-3 text-gray-700">
              <Mail size={16} />
              <span className="text-sm">kiett5153@gmail.com</span>
            </div>
          </div>

          {/* Teams Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Teams</h2>
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm">
              <Plus size={16} />
              Create a team
            </button>
          </div>

          <button className="text-blue-600 hover:text-blue-700 text-sm">
            View privacy policy
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 pt-8">
          {/* Worked On Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Worked on</h2>
                <p className="text-sm text-gray-600">Others will only see what they can access.</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm">
                View all
              </button>
            </div>

            <div className="space-y-3">
              {projects.map((project, index) => (
                <div key={project.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md">
                  <input 
                    type="checkbox" 
                    checked 
                    readOnly
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{project.name}</div>
                    <div className="text-sm text-gray-600">
                      Project • You created this on {project.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="text-gray-600 hover:text-gray-800 text-sm mt-4">
              Show more
            </button>
          </div>

          {/* Places You Work In Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Places you work in</h2>
            
            <div className="space-y-3">
              {workplaces.map((workplace, index) => (
                <div key={index} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-semibold">J</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{workplace.name}</span>
                      {workplace.badge && <span className="text-yellow-500">{workplace.badge}</span>}
                    </div>
                    <div className="text-sm text-gray-600">{workplace.platform}</div>
                  </div>
                  <ExternalLink size={16} className="text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;