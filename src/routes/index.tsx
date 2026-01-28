import { createFileRoute } from '@tanstack/react-router'
import { AuthLayout } from '@/components/ui/auth-layout'
import { Button } from '@/components/ui/button'
import { Heading, Subheading } from '@/components/ui/heading'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <AuthLayout>
      <div className="w-full max-w-4xl text-center space-y-8">
        <div className="space-y-4">
          <Heading className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            ⚽ Tourny
          </Heading>
          <Subheading className="text-xl text-gray-600 dark:text-gray-300">
            The Ultimate Tournament Prediction Game
          </Subheading>
        </div>

        <div className="space-y-6">
          <p className="text-lg text-gray-700 dark:text-gray-200 max-w-2xl mx-auto">
            Think you know football? Prove it! Join Tourny to predict World Cup
            matches, compete with friends, and climb the leaderboards. Every
            goal matters, every prediction counts.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700">
              <div className="text-3xl mb-3">🎯</div>
              <Heading level={4} className="mb-2">
                Make Predictions
              </Heading>
              <p className="text-gray-600 dark:text-gray-300">
                Predict match scores and tournament winners. Score points for
                accurate predictions and climb the rankings.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700">
              <div className="text-3xl mb-3">👥</div>
              <Heading level={4} className="mb-2">
                Create Groups
              </Heading>
              <p className="text-gray-600 dark:text-gray-300">
                Start or join prediction groups with friends, family, or
                colleagues. See who really knows their football.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700">
              <div className="text-3xl mb-3">🏆</div>
              <Heading level={4} className="mb-2">
                Compete & Win
              </Heading>
              <p className="text-gray-600 dark:text-gray-300">
                Track your progress on leaderboards, view detailed statistics,
                and prove you're the ultimate football predictor.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <Heading level={4} className="mb-3">
              🌟 Ready for the Next World Cup?
            </Heading>
            <p className="text-gray-700 dark:text-gray-200 mb-4">
              Join football fans making predictions, competing in groups, and
              testing their knowledge against the best in the world.
            </p>
            <div className="flex gap-4 justify-center">
              <Button color="blue" className="px-8 py-3 text-lg" href="/signup">
                Get Started Free
              </Button>
              <Button color="zinc" className="px-8 py-3 text-lg" href="/signin">
                Sign In
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
            <p>✓ Free to play</p>
            <p>✓ No downloads required</p>
            <p>✓ Play with friends worldwide</p>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
