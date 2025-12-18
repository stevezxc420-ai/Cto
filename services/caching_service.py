import asyncio
import hashlib
import json
from typing import Any, Optional, Dict
from datetime import datetime, timedelta
import time

class MemoryCache:
    """Simple in-memory caching service."""
    
    def __init__(self, default_ttl: int = 300):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.default_ttl = default_ttl
    
    def _is_expired(self, key: str) -> bool:
        """Check if a cache entry is expired."""
        if key not in self.cache:
            return True
        
        cache_entry = self.cache[key]
        if "expires_at" not in cache_entry:
            return False
        
        return datetime.utcnow() > cache_entry["expires_at"]
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        if self._is_expired(key):
            if key in self.cache:
                del self.cache[key]
            return None
        
        return self.cache[key].get("value")
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set value in cache with optional TTL."""
        ttl = ttl or self.default_ttl
        expires_at = datetime.utcnow() + timedelta(seconds=ttl)
        
        self.cache[key] = {
            "value": value,
            "expires_at": expires_at,
            "created_at": datetime.utcnow()
        }
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        if key in self.cache:
            del self.cache[key]
            return True
        return False
    
    async def clear(self) -> None:
        """Clear all cache entries."""
        self.cache.clear()
    
    async def cleanup_expired(self) -> int:
        """Remove expired entries and return count removed."""
        expired_keys = [
            key for key in self.cache.keys() 
            if self._is_expired(key)
        ]
        
        for key in expired_keys:
            del self.cache[key]
        
        return len(expired_keys)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total_entries = len(self.cache)
        expired_entries = sum(1 for key in self.cache.keys() if self._is_expired(key))
        
        return {
            "total_entries": total_entries,
            "active_entries": total_entries - expired_entries,
            "expired_entries": expired_entries,
            "default_ttl": self.default_ttl
        }

class CachingService:
    """Main caching service with multiple backends support."""
    
    def __init__(self, default_ttl: int = 300):
        self.memory_cache = MemoryCache(default_ttl)
        self.default_ttl = default_ttl
    
    def _generate_cache_key(self, original_key: str) -> str:
        """Generate a consistent cache key."""
        return hashlib.md5(original_key.encode()).hexdigest()
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        cache_key = self._generate_cache_key(key)
        return await self.memory_cache.get(cache_key)
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set value in cache."""
        cache_key = self._generate_cache_key(key)
        await self.memory_cache.set(cache_key, value, ttl)
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        cache_key = self._generate_cache_key(key)
        return await self.memory_cache.delete(cache_key)
    
    async def clear(self) -> None:
        """Clear all cache entries."""
        await self.memory_cache.clear()
    
    async def cleanup_expired(self) -> int:
        """Remove expired entries."""
        return await self.memory_cache.cleanup_expired()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        return self.memory_cache.get_stats()
    
    # Context manager for batch operations
    async def batch_set(self, items: Dict[str, Any], ttl: Optional[int] = None) -> None:
        """Set multiple values in cache."""
        for key, value in items.items():
            await self.set(key, value, ttl)
    
    async def batch_get(self, keys: list) -> Dict[str, Optional[Any]]:
        """Get multiple values from cache."""
        results = {}
        for key in keys:
            results[key] = await self.get(key)
        return results