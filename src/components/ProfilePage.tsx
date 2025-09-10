import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Edit, 
  Save, 
  X, 
  MapPin, 
  Building, 
  Mail, 
  Phone,
  GraduationCap,
  Plus,
  Minus
} from 'lucide-react';
import { fallbackDatabase as mongoDatabase } from '../lib/fallbackDatabase';

interface ProfilePageProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
}

export function ProfilePage({ user, onUpdateUser }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  // Sync editedUser when user prop changes
  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  const handleSave = async () => {
    // Update user in database
    const updatedUser = await mongoDatabase.updateUser(user.id, editedUser);
    if (updatedUser) {
      onUpdateUser(updatedUser);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const addSkill = () => {
    const skills = editedUser.skills || [];
    setEditedUser({...editedUser, skills: [...skills, '']});
  };

  const removeSkill = (index: number) => {
    const skills = editedUser.skills || [];
    const newSkills = skills.filter((_, i) => i !== index);
    setEditedUser({...editedUser, skills: newSkills});
  };

  const updateSkill = (index: number, value: string) => {
    const skills = editedUser.skills || [];
    const newSkills = [...skills];
    newSkills[index] = value;
    setEditedUser({...editedUser, skills: newSkills});
  };

  // Helper function to display field value or placeholder
  const displayField = (value: any, placeholder: string = 'Not provided') => {
    if (!value || value === '') {
      return <span className="text-gray-400 italic">{placeholder}</span>;
    }
    return <span className="text-gray-600">{String(value)}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="border-0 shadow-lg rounded-xl mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                  {user.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-gray-900">{user.name}</h1>
                    {user.position && user.company ? (
                      <p className="text-gray-600">{user.position} at {user.company}</p>
                    ) : user.userType ? (
                      <p className="text-gray-600 capitalize">{user.userType}</p>
                    ) : null}
                  </div>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? "outline" : "default"}
                    className="rounded-lg mt-4 md:mt-0"
                  >
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-4 text-gray-600">
                  {user.graduationYear && (
                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      <span>Class of {user.graduationYear}</span>
                    </div>
                  )}
                  {user.major && (
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2" />
                      <span>{user.major}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{user.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Information */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md rounded-xl">
              <CardHeader>
                <CardTitle className="text-gray-900">Profile Information</CardTitle>
                <CardDescription>Manage your personal and professional details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={editedUser.name}
                          onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={editedUser.email}
                          onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                          className="rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="userType">User Type</Label>
                        <Select value={editedUser.userType} onValueChange={(value) => setEditedUser({...editedUser, userType: value})}>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Select user type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alumni">Alumni</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Faculty/Teacher</SelectItem>
                            <SelectItem value="management">Management Staff</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="Enter phone number"
                          value={editedUser.phone || ''}
                          onChange={(e) => setEditedUser({...editedUser, phone: e.target.value})}
                          className="rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          placeholder="Enter company name"
                          value={editedUser.company || ''}
                          onChange={(e) => setEditedUser({...editedUser, company: e.target.value})}
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input
                          id="position"
                          placeholder="Enter job position"
                          value={editedUser.position || ''}
                          onChange={(e) => setEditedUser({...editedUser, position: e.target.value})}
                          className="rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="Enter your location"
                          value={editedUser.location || ''}
                          onChange={(e) => setEditedUser({...editedUser, location: e.target.value})}
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="college">College</Label>
                        <Input
                          id="college"
                          placeholder="Enter college name"
                          value={editedUser.college || ''}
                          onChange={(e) => setEditedUser({...editedUser, college: e.target.value})}
                          className="rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself..."
                        value={editedUser.bio || ''}
                        onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                        className="rounded-lg"
                        rows={4}
                      />
                    </div>

                    {/* Skills Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Skills</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addSkill}
                          className="rounded-lg"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Skill
                        </Button>
                      </div>
                      {(editedUser.skills || []).map((skill, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            placeholder="Enter a skill"
                            value={skill}
                            onChange={(e) => updateSkill(index, e.target.value)}
                            className="rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSkill(index)}
                            className="rounded-lg"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {(!editedUser.skills || editedUser.skills.length === 0) && (
                        <p className="text-gray-400 italic text-sm">No skills added yet. Click "Add Skill" to start.</p>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <Button onClick={handleSave} className="rounded-lg">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancel} className="rounded-lg">
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-gray-900">Full Name</Label>
                        <p className="text-gray-600 mt-1">{user.name}</p>
                      </div>
                      <div>
                        <Label className="text-gray-900">Email</Label>
                        <p className="text-gray-600 mt-1">{user.email}</p>
                      </div>
                      <div>
                        <Label className="text-gray-900">User Type</Label>
                        <p className="text-gray-600 mt-1 capitalize">{displayField(user.userType)}</p>
                      </div>
                      <div>
                        <Label className="text-gray-900">Phone</Label>
                        <p className="mt-1">{displayField(user.phone)}</p>
                      </div>
                      <div>
                        <Label className="text-gray-900">Company</Label>
                        <p className="mt-1">{displayField(user.company)}</p>
                      </div>
                      <div>
                        <Label className="text-gray-900">Position</Label>
                        <p className="mt-1">{displayField(user.position)}</p>
                      </div>
                      <div>
                        <Label className="text-gray-900">Location</Label>
                        <p className="mt-1">{displayField(user.location)}</p>
                      </div>
                      <div>
                        <Label className="text-gray-900">College</Label>
                        <p className="mt-1">{displayField(user.college)}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Label className="text-gray-900">Bio</Label>
                      <p className="mt-1">{displayField(user.bio, "No bio provided yet. Click 'Edit Profile' to add one.")}</p>
                    </div>

                    <div>
                      <Label className="text-gray-900">Skills</Label>
                      {user.skills && user.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {user.skills.filter(skill => skill.trim()).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="rounded-full">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic mt-1">No skills added yet. Click 'Edit Profile' to add some.</p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="border-0 shadow-md rounded-xl">
              <CardHeader>
                <CardTitle className="text-gray-900">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{user.phone}</span>
                  </div>
                )}
                {!user.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-300" />
                    <span className="text-gray-400 italic">Phone not provided</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card className="border-0 shadow-md rounded-xl">
              <CardHeader>
                <CardTitle className="text-gray-900">Academic Background</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-900">Major</Label>
                  <p className="mt-1">{displayField(user.major)}</p>
                </div>
                <div>
                  <Label className="text-gray-900">Branch</Label>
                  <p className="mt-1">{displayField(user.branch)}</p>
                </div>
                <div>
                  <Label className="text-gray-900">College</Label>
                  <p className="mt-1">{displayField(user.college)}</p>
                </div>
                {user.graduationYear && (
                  <div>
                    <Label className="text-gray-900">Graduation Year</Label>
                    <p className="text-gray-600">{user.graduationYear}</p>
                  </div>
                )}
                {user.enrollmentYear && (
                  <div>
                    <Label className="text-gray-900">Enrollment Year</Label>
                    <p className="text-gray-600">{user.enrollmentYear}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Professional Information */}
            {(user.company || user.position || user.experience) && (
              <Card className="border-0 shadow-md rounded-xl">
                <CardHeader>
                  <CardTitle className="text-gray-900">Professional Background</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.company && (
                    <div>
                      <Label className="text-gray-900">Company</Label>
                      <p className="text-gray-600">{user.company}</p>
                    </div>
                  )}
                  {user.position && (
                    <div>
                      <Label className="text-gray-900">Position</Label>
                      <p className="text-gray-600">{user.position}</p>
                    </div>
                  )}
                  {user.experience && (
                    <div>
                      <Label className="text-gray-900">Experience</Label>
                      <p className="text-gray-600">{user.experience}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}