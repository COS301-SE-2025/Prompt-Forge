import { ReviewCard } from './ReviewCard';
import { User, Share2, BookOpen, MessageSquare, Info, Star } from 'lucide-react';
import { PurchaseButton } from './PurchaseButton';
import { StarRating } from './StarRating';
import { Card } from './ui/Card';
import { ReviewForm } from './ReviewForm';
export const PromptDetails = () => {
  // Mock data for the prompt
  const prompt = {
    id: '1',
    title: 'Advanced SEO Content Optimizer',
    category: 'Marketing',
    tags: ['SEO', 'Content', 'Marketing'],
    rating: 4.8,
    price: 6.99,
    author: '@seomaster',
    uses: 2389,
    description: 'Optimize your content for search engines with this advanced SEO prompt that covers keyword research, content structure, meta descriptions, and more.',
    promptText: 'Create SEO-optimized content for [TOPIC] targeting the keyword [KEYWORD]. Include proper H1, H2, and H3 structure, meta description, and ensure keyword density is between 1-2%. Add relevant LSI keywords and suggest internal linking opportunities.',
    exampleResponse: `# Ultimate Guide to Sustainable Gardening\n\nMeta Description: Learn sustainable gardening practices with our comprehensive guide. Discover eco-friendly techniques, water conservation methods, and organic pest control for a thriving garden.\n\n## What is Sustainable Gardening?\nSustainable gardening focuses on environmentally friendly practices that conserve resources while creating a beautiful and productive garden ecosystem...\n\n## 7 Essential Sustainable Gardening Techniques\n\n### 1. Composting Basics\nTurn kitchen scraps and yard waste into nutrient-rich soil amendment...\n\n### 2. Water Conservation Methods\nImplement drip irrigation and rainwater harvesting to reduce water usage...\n\n## Recommended Internal Links:\n- Organic Pest Control Methods\n- Beginner's Guide to Composting\n- Water-Wise Garden Design`,
    createdAt: '2023-05-15'
  };
  // Mock data for reviews
  const reviews = [{
    id: '1',
    author: 'ContentCreator123',
    date: 'July 15, 2023',
    rating: 5,
    comment: 'This prompt has completely transformed my content strategy. The SEO suggestions are spot on and have helped me rank higher for my target keywords. Worth every penny!'
  }, {
    id: '2',
    author: 'MarketingPro',
    date: 'June 28, 2023',
    rating: 4.5,
    comment: 'Very comprehensive prompt that helps create well-structured content. I would have given it 5 stars if it had more suggestions for featured snippet optimization.'
  }, {
    id: '3',
    author: 'BloggerExpert',
    date: 'August 2, 2023',
    rating: 5,
    comment: 'The LSI keyword suggestions are incredibly valuable. My content is ranking better than ever before. Highly recommend to anyone serious about SEO.'
  }];
  const handlePurchase = () => {
    alert('Purchase functionality would go here!');
  };
  const handleShare = (platform: string) => {
    alert(`Sharing to ${platform}...`);
  };
  const sections = [{
    id: 'description',
    label: 'Description',
    icon: Info
  }, {
    id: 'prompt',
    label: 'Prompt',
    icon: BookOpen
  }, {
    id: 'example',
    label: 'Example',
    icon: MessageSquare
  }, {
    id: 'reviews',
    label: 'Reviews',
    icon: Star
  }];
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  return <div className="container px-4 py-8 mx-auto max-w-7xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex text-sm text-gray-500 dark:text-gray-400">
          <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">
            Marketplace
          </a>
          <span className="mx-2">/</span>
          <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">
            Marketing
          </a>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white">{prompt.title}</span>
        </nav>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Prompt header */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {prompt.category}
              </span>
              <div className="ml-3">
                <StarRating rating={prompt.rating} size="md" />
              </div>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              {prompt.title}
            </h1>
          </div>
          {/* Table of Contents - Mobile Only */}
          <div className="p-4 mb-6 border rounded-lg lg:hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
              Quick Navigation
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {sections.map(section => <button key={section.id} onClick={() => scrollToSection(section.id)} className="flex items-center px-3 py-2 text-sm text-gray-600 transition-colors rounded-md dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <section.icon className="w-4 h-4 mr-2" />
                  {section.label}
                </button>)}
            </div>
          </div>
          {/* Prompt description */}
            <Card id='description' className='mb-5 p-5 '>
              <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {prompt.description}
              </p>
            </Card>
          {/* Prompt text */}
        <Card className='mb-5 p-5'>
            <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
              Prompt
            </h2>
          <div className="p-4 rounded-md bg-card dark:bg-[#191919]">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {prompt.promptText}
              </p>
            </div>
          </Card>
          {/* Example response */}
          {/* Reviews */}
          <Card id="reviews" className="p-5 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Reviews
              </h2>
              <div className="flex items-center">
                <StarRating rating={prompt.rating} size="lg" />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  from {reviews.length} reviews
                </span>
              </div>
            </div>
            <div className="space-y-4">
              {reviews.map(review => <ReviewCard key={review.id} author={review.author} date={review.date} rating={review.rating} comment={review.comment} />)}
            </div>
            <ReviewForm/>
          </Card>
        </div>
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card className="sticky p-5 border rounded-lg top-20 ">
              <div className="mb-6">
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  Pricing
                </h3>
                <p className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                  ${prompt.price.toFixed(2)}
                </p>
                <PurchaseButton price={prompt.price} onClick={handlePurchase} />
                {/* button below to be used when the user is the creator of the prompt*/}
                {/* <Button onClick={handlePurchase} className='w-full mt-3 bg-transparent text-[#3ebb9e] hover:text-[#00674f] hover:bg-transparent'>
                  <Pencil className="w-5 h-5 mr-2 text" />
                  Edit prompt
                </Button> */}
              </div>
              {/* Author Info */}
              <div className="pt-6 mb-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">
                  Creator
                </h3>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {prompt.author}
                    </p>
                    
                  </div>
                </div>
              </div>
              {/* Stats */}
              <div className="pt-6 mb-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">
                  Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-green-100 text-blue-800 dark:bg-green-900 dark:text-green-300">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Uses
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {prompt.uses}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Rating
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {prompt.rating}/5
                    </p>
                  </div>
                </div>
              </div>
              {/* Share */}
              <div className="pt-6 mb-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">
                  Share
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Twitter', 'LinkedIn'].map(platform => <button key={platform} onClick={() => handleShare(platform)} className="flex items-center justify-center px-3 py-2 text-sm text-gray-600 transition-colors border rounded-md dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600">
                      <Share2 className="w-4 h-4 mr-2" />
                      {platform}
                    </button>)}
                </div>
              </div>
              {/* Tags */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {prompt.tags.map((tag, index) => <span key={index} className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {tag}
                    </span>)}
                </div>
              </div>
            </Card>
            {/* Table of Contents - Desktop Only */}
            {/* <div className="sticky hidden p-4 border rounded-lg top-96 lg:block bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                On this page
              </h3>
              <nav className="space-y-1">
                {sections.map(section => <button key={section.id} onClick={() => scrollToSection(section.id)} className="flex items-center w-full px-3 py-2 text-sm text-gray-600 transition-colors rounded-md dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <section.icon className="w-4 h-4 mr-2" />
                    {section.label}
                  </button>)}
              </nav>
            </div> */}
          </div>
        </div>
      </div>
    </div>;
};