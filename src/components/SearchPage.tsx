import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { 
  Search, 
  Filter, 
  Users, 
  GraduationCap,
  Building,
  Calendar,
  MapPin,
  Briefcase,
  BookOpen,
  MessageCircle,
  Mail,
  Phone,
  X,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { fallbackDatabase as mongoDatabase } from '../lib/fallbackDatabase';
import { type User } from '../lib/database';

interface SearchPageProps {
  user: any;
}

export function SearchPage({ user: currentUser }: SearchPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [filters, setFilters] = useState({
    userType: '',
    college: '',
    company: '',
    major: '',
    branch: '',
    graduationYear: '',
    location: '',
    skills: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get unique values for filter dropdowns
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await mongoDatabase.getAllUsers();
        setAllUsers(users.filter(u => u.id !== currentUser.id));
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };
    loadUsers();
  }, [currentUser.id]);
  const uniqueColleges = useMemo(() => [...new Set(allUsers.map(u => u.college).filter(Boolean))], [allUsers]);
  const uniqueCompanies = useMemo(() => [...new Set(allUsers.map(u => u.company).filter(Boolean))], [allUsers]);
  const uniqueMajors = useMemo(() => [...new Set(allUsers.map(u => u.major).filter(Boolean))], [allUsers]);
  const uniqueBranches = useMemo(() => [...new Set(allUsers.map(u => u.branch).filter(Boolean))], [allUsers]);
  const uniqueLocations = useMemo(() => [...new Set(allUsers.map(u => u.location).filter(Boolean))], [allUsers]);

  const performSearch = useCallback(() => {
    setLoading(true);
    
    try {
      let results = allUsers;

      // Text search across multiple fields
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        results = results.filter(user => 
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.major?.toLowerCase().includes(searchLower) ||
          user.branch?.toLowerCase().includes(searchLower) ||
          user.company?.toLowerCase().includes(searchLower) ||
          user.position?.toLowerCase().includes(searchLower) ||
          user.college?.toLowerCase().includes(searchLower) ||
          user.location?.toLowerCase().includes(searchLower) ||
          user.bio?.toLowerCase().includes(searchLower) ||
          user.skills?.some(skill => skill.toLowerCase().includes(searchLower)) ||
          user.department?.toLowerCase().includes(searchLower)
        );
      }

      // Apply filters
      if (filters.userType) {
        results = results.filter(user => user.userType === filters.userType);
      }
      
      if (filters.college) {
        results = results.filter(user => user.college === filters.college);
      }
      
      if (filters.company) {
        results = results.filter(user => user.company === filters.company);
      }
      
      if (filters.major) {
        results = results.filter(user => user.major === filters.major);
      }
      
      if (filters.branch) {
        results = results.filter(user => user.branch === filters.branch);
      }
      
      if (filters.graduationYear) {
        results = results.filter(user => 
          user.graduationYear?.toString() === filters.graduationYear
        );
      }
      
      if (filters.location) {
        results = results.filter(user => user.location === filters.location);
      }
      
      if (filters.skills) {
        const skillsLower = filters.skills.toLowerCase();
        results = results.filter(user => 
          user.skills?.some(skill => skill.toLowerCase().includes(skillsLower))
        );
      }

      // AI-like relevance scoring
      if (searchTerm) {
        results = results.map(user => {
          let score = 0;
          const searchLower = searchTerm.toLowerCase();
          
          // Name matching (highest priority)
          if (user.name.toLowerCase().includes(searchLower)) score += 10;
          
          // Major/field matching
          if (user.major?.toLowerCase().includes(searchLower)) score += 8;
          
          // Company matching
          if (user.company?.toLowerCase().includes(searchLower)) score += 6;
          
          // Position matching
          if (user.position?.toLowerCase().includes(searchLower)) score += 5;
          
          // Skills matching
          if (user.skills?.some(skill => skill.toLowerCase().includes(searchLower))) score += 7;
          
          // College matching
          if (user.college?.toLowerCase().includes(searchLower)) score += 4;
          
          // Location matching
          if (user.location?.toLowerCase().includes(searchLower)) score += 3;
          
          // Bio matching
          if (user.bio?.toLowerCase().includes(searchLower)) score += 2;
          
          // Same user type bonus
          if (currentUser.userType === user.userType) score += 1;
          
          return { user, score };
        })
        .sort((a, b) => b.score - a.score)
        .map(result => result.user);
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, allUsers]);

  useEffect(() => {
    if (searchTerm || Object.values(filters).some(filter => filter)) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, filters, performSearch]);

  const clearFilter = (filterKey: string) => {
    setFilters(prev => ({ ...prev, [filterKey]: '' }));
  };

  const clearAllFilters = () => {
    setFilters({
      userType: '',
      college: '',
      company: '',
      major: '',
      branch: '',
      graduationYear: '',
      location: '',
      skills: ''
    });
    setSearchTerm('');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'alumni': return 'bg-blue-100 text-blue-700';
      case 'student': return 'bg-green-100 text-green-700';
      case 'teacher': return 'bg-purple-100 text-purple-700';
      case 'management': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-gray-900">Search Directory</h1>
              <p className="text-gray-600 mt-2">Find alumni, students, faculty, and staff</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">AI-Powered Search</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-md rounded-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Filter className="w-5 h-5 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </CardTitle>
                  {activeFiltersCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAllFilters}
                      className="text-red-600 hover:text-red-700"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* User Type Filter */}
                <div className="space-y-2">
                  <Label>User Type</Label>
                  <Select value={filters.userType} onValueChange={(value) => setFilters(prev => ({ ...prev, userType: value }))}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alumni">Alumni</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="teacher">Faculty</SelectItem>
                      <SelectItem value="management">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  {filters.userType && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter('userType')}
                      className="h-6 w-full text-xs text-red-600 hover:text-red-700"
                    >
                      Clear filter
                    </Button>
                  )}
                </div>

                {/* College Filter */}
                <div className="space-y-2">
                  <Label>College</Label>
                  <Select value={filters.college} onValueChange={(value) => setFilters(prev => ({ ...prev, college: value }))}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="All colleges" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueColleges.map(college => (
                        <SelectItem key={college} value={college}>{college}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filters.college && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter('college')}
                      className="h-6 w-full text-xs text-red-600 hover:text-red-700"
                    >
                      Clear filter
                    </Button>
                  )}
                </div>

                {/* Advanced Filters Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="w-full rounded-lg"
                >
                  Advanced Filters
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                </Button>

                {showAdvancedFilters && (
                  <div className="space-y-4 pt-2">
                    {/* Company Filter */}
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Select value={filters.company} onValueChange={(value) => setFilters(prev => ({ ...prev, company: value }))}>
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="All companies" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueCompanies.map(company => (
                            <SelectItem key={company} value={company}>{company}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filters.company && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearFilter('company')}
                          className="h-6 w-full text-xs text-red-600 hover:text-red-700"
                        >
                          Clear filter
                        </Button>
                      )}
                    </div>

                    {/* Major Filter */}
                    <div className="space-y-2">
                      <Label>Major</Label>
                      <Select value={filters.major} onValueChange={(value) => setFilters(prev => ({ ...prev, major: value }))}>
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="All majors" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueMajors.map(major => (
                            <SelectItem key={major} value={major}>{major}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filters.major && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearFilter('major')}
                          className="h-6 w-full text-xs text-red-600 hover:text-red-700"
                        >
                          Clear filter
                        </Button>
                      )}
                    </div>

                    {/* Branch Filter */}
                    <div className="space-y-2">
                      <Label>Branch</Label>
                      <Select value={filters.branch} onValueChange={(value) => setFilters(prev => ({ ...prev, branch: value }))}>
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="All branches" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueBranches.map(branch => (
                            <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filters.branch && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearFilter('branch')}
                          className="h-6 w-full text-xs text-red-600 hover:text-red-700"
                        >
                          Clear filter
                        </Button>
                      )}
                    </div>

                    {/* Graduation Year Filter */}
                    <div className="space-y-2">
                      <Label>Graduation Year</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 2020"
                        value={filters.graduationYear}
                        onChange={(e) => setFilters(prev => ({ ...prev, graduationYear: e.target.value }))}
                        className="rounded-lg"
                      />
                      {filters.graduationYear && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearFilter('graduationYear')}
                          className="h-6 w-full text-xs text-red-600 hover:text-red-700"
                        >
                          Clear filter
                        </Button>
                      )}
                    </div>

                    {/* Location Filter */}
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueLocations.map(location => (
                            <SelectItem key={location} value={location}>{location}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filters.location && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearFilter('location')}
                          className="h-6 w-full text-xs text-red-600 hover:text-red-700"
                        >
                          Clear filter
                        </Button>
                      )}
                    </div>

                    {/* Skills Filter */}
                    <div className="space-y-2">
                      <Label>Skills</Label>
                      <Input
                        placeholder="e.g., JavaScript, Marketing"
                        value={filters.skills}
                        onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                        className="rounded-lg"
                      />
                      {filters.skills && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearFilter('skills')}
                          className="h-6 w-full text-xs text-red-600 hover:text-red-700"
                        >
                          Clear filter
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Active Filters */}
                {activeFiltersCount > 0 && (
                  <div className="pt-4 border-t">
                    <Label className="text-sm text-gray-600 mb-2 block">Active Filters:</Label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(filters).map(([key, value]) => {
                        if (!value) return null;
                        return (
                          <Badge key={key} variant="secondary" className="flex items-center gap-1">
                            {key}: {value}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => clearFilter(key)}
                              className="h-3 w-3 p-0 hover:bg-transparent"
                            >
                              <X className="w-2 h-2" />
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name, company, major, skills, or any keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 rounded-lg h-12 text-base"
                />
              </div>
            </div>

            {/* Results */}
            <Card className="border-0 shadow-md rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Search Results
                    {searchResults.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {searchResults.length} found
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Searching...</p>
                  </div>
                ) : searchResults.length === 0 && (searchTerm || activeFiltersCount > 0) ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-500">Try adjusting your search terms or filters</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-gray-900 mb-2">Start searching</h3>
                    <p className="text-gray-500">Enter a search term or apply filters to find people</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {searchResults.map(person => (
                        <Card key={person.id} className="border rounded-lg hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <Avatar className="w-16 h-16">
                                <AvatarFallback className="bg-blue-600 text-white text-lg">
                                  {getInitials(person.name)}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-gray-900 truncate">{person.name}</h4>
                                  <Badge className={getUserTypeColor(person.userType || 'alumni')}>
                                    {person.userType || 'Alumni'}
                                  </Badge>
                                </div>
                                
                                {person.position && person.company && (
                                  <div className="flex items-center mb-2">
                                    <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="text-gray-600">{person.position} at {person.company}</span>
                                  </div>
                                )}
                                
                                {person.major && (
                                  <div className="flex items-center mb-2">
                                    <BookOpen className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="text-gray-600">
                                      {person.major}
                                      {person.branch && ` - ${person.branch}`}
                                    </span>
                                  </div>
                                )}
                                
                                {person.graduationYear && (
                                  <div className="flex items-center mb-2">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="text-gray-600">Class of {person.graduationYear}</span>
                                  </div>
                                )}
                                
                                {person.college && (
                                  <div className="flex items-center mb-2">
                                    <GraduationCap className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="text-gray-600">{person.college}</span>
                                  </div>
                                )}
                                
                                {person.location && (
                                  <div className="flex items-center mb-2">
                                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="text-gray-600">{person.location}</span>
                                  </div>
                                )}
                                
                                {person.skills && person.skills.length > 0 && (
                                  <div className="mb-3">
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {person.skills.slice(0, 4).map((skill, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {skill}
                                        </Badge>
                                      ))}
                                      {person.skills.length > 4 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{person.skills.length - 4} more
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {person.bio && (
                                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{person.bio}</p>
                                )}
                                
                                <div className="flex space-x-2">
                                  <Button size="sm" className="rounded-lg">
                                    <MessageCircle className="w-4 h-4 mr-1" />
                                    Message
                                  </Button>
                                  <Button variant="outline" size="sm" className="rounded-lg">
                                    <Mail className="w-4 h-4 mr-1" />
                                    Email
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}