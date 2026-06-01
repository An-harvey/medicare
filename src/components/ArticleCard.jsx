export default function ArticleCard({ article }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group cursor-pointer">
      {/* Thumbnail */}
      <div className="overflow-hidden h-44">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${article.categoryColor}`}>
            {article.category}
          </span>
          <span className="text-xs text-gray-400">{article.readTime} đọc</span>
        </div>

        <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>

        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-[10px] text-blue-600 font-bold">
              {article.author.charAt(article.author.lastIndexOf(' ') + 1)}
            </div>
            <span className="text-xs text-gray-500 truncate max-w-[120px]">{article.author}</span>
          </div>
          <span className="text-xs text-gray-400">{article.date}</span>
        </div>
      </div>
    </div>
  );
}
