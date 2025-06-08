
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MoodSelectorProps {
  selectedMood: string | null;
  onMoodSelect: (mood: string | null) => void;
}

const MoodSelector = ({ selectedMood, onMoodSelect }: MoodSelectorProps) => {
  const moods = [
    {
      id: 'adventurous',
      label: 'Adventurous',
      emoji: '🔥',
      description: 'Ready for excitement',
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'relaxed',
      label: 'Relaxed',
      emoji: '🧘',
      description: 'Need to unwind',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'social',
      label: 'Social',
      emoji: '🎉',
      description: 'Want to meet people',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'foodie',
      label: 'Foodie',
      emoji: '🍽️',
      description: 'Craving good food',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">What's your mood?</h2>
        <p className="text-muted-foreground">Let us suggest places that match how you're feeling</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {moods.map((mood) => (
          <Card
            key={mood.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedMood === mood.id
                ? 'ring-2 ring-blue-500 shadow-lg'
                : 'hover:shadow-md'
            }`}
            onClick={() => onMoodSelect(selectedMood === mood.id ? null : mood.id)}
          >
            <CardContent className="p-4 text-center">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${mood.color} flex items-center justify-center text-2xl mb-3 mx-auto`}>
                {mood.emoji}
              </div>
              <h3 className="font-semibold mb-1">{mood.label}</h3>
              <p className="text-xs text-muted-foreground">{mood.description}</p>
              {selectedMood === mood.id && (
                <Badge className="mt-2 bg-blue-500">Selected</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedMood && (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMoodSelect(null)}
          >
            Clear Selection
          </Button>
        </div>
      )}
    </div>
  );
};

export default MoodSelector;
