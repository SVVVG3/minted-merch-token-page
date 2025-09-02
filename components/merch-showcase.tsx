"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import { openShopUrl } from "@/lib/farcaster-utils"

interface ShopifyProduct {
  id: string
  title: string
  handle: string
  images: {
    edges: Array<{
      node: {
        url: string
        altText: string
      }
    }>
  }
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  tags: string[]
  createdAt: string
}

interface ShopifyResponse {
  data: {
    products: {
      edges: Array<{
        node: ShopifyProduct
      }>
    }
  }
  errors?: Array<{
    message: string
    extensions?: any
  }>
}

export function MerchShowcase() {
  const [products, setProducts] = useState<ShopifyProduct[]>([])
  const [loading, setLoading] = useState(true)

  // Configuration options - easily change these to control what products show
  const PRODUCTS_TO_SHOW = 4
  const PRODUCT_FILTER = "tag:featured" // Options: "tag:featured", "tag:bestseller", "available_for_sale:true", etc.

  // You'll need to add these environment variables
  const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || 'frensdaily-shop.myshopify.com'
  const SHOPIFY_STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN

  // Ensure we're using the .myshopify.com domain for API calls
  const apiDomain = SHOPIFY_DOMAIN.includes('.myshopify.com') 
    ? SHOPIFY_DOMAIN 
    : SHOPIFY_DOMAIN.replace('.shop', '.myshopify.com').replace('.com', '.myshopify.com')

  useEffect(() => {
    const fetchProducts = async () => {
      console.log('🛍️ Shopify Integration Debug:')
      console.log('Domain:', SHOPIFY_DOMAIN)
      console.log('API Domain:', apiDomain)
      console.log('Token exists:', !!SHOPIFY_STOREFRONT_TOKEN)
      console.log('Token length:', SHOPIFY_STOREFRONT_TOKEN?.length || 0)

      if (!SHOPIFY_STOREFRONT_TOKEN) {
        console.error('❌ Shopify Storefront Access Token not found - using placeholder products')
        // Use placeholder products for now
        setProducts([
          {
            id: 'placeholder-1',
            title: 'Crypto Hoodie',
            handle: 'crypto-hoodie',
            images: { edges: [{ node: { url: '/black-hoodie-with-crypto-inspired-streetwear-desig.png', altText: 'Crypto Hoodie' } }] },
            priceRange: { minVariantPrice: { amount: '65.00', currencyCode: 'USD' } },
            tags: ['featured'],
            createdAt: '2024-01-01'
          },
          {
            id: 'placeholder-2', 
            title: 'Base Blockchain T-Shirt',
            handle: 'base-blockchain-tshirt',
            images: { edges: [{ node: { url: '/white-t-shirt-with-base-blockchain-logo-design.png', altText: 'Base T-Shirt' } }] },
            priceRange: { minVariantPrice: { amount: '35.00', currencyCode: 'USD' } },
            tags: ['featured'],
            createdAt: '2024-01-01'
          },
          {
            id: 'placeholder-3',
            title: 'DeFi Baseball Cap', 
            handle: 'defi-baseball-cap',
            images: { edges: [{ node: { url: '/black-baseball-cap-with-defi-embroidered-design.png', altText: 'DeFi Cap' } }] },
            priceRange: { minVariantPrice: { amount: '25.00', currencyCode: 'USD' } },
            tags: ['featured'],
            createdAt: '2024-01-01'
          },
          {
            id: 'placeholder-4',
            title: 'Minted Crewneck',
            handle: 'minted-crewneck', 
            images: { edges: [{ node: { url: '/gray-crewneck-sweatshirt-with-minimalist-minted-lo.png', altText: 'Minted Crewneck' } }] },
            priceRange: { minVariantPrice: { amount: '55.00', currencyCode: 'USD' } },
            tags: ['featured'],
            createdAt: '2024-01-01'
          }
        ])
        setLoading(false)
        return
      }

      try {
        const query = `
          query getProducts($first: Int!, $query: String) {
            products(first: $first, query: $query) {
              edges {
                node {
                  id
                  title
                  handle
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  tags
                  createdAt
                }
              }
            }
          }
        `

        const response = await fetch(`https://${apiDomain}/api/2023-10/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
          },
          body: JSON.stringify({
            query,
            variables: { 
              first: PRODUCTS_TO_SHOW,
              query: PRODUCT_FILTER
            }
          })
        })

        const data: ShopifyResponse = await response.json()
        console.log('📦 Shopify API Response:', data)
        
        if (data.data?.products?.edges) {
          console.log('✅ Found', data.data.products.edges.length, 'products')
          setProducts(data.data.products.edges.map(edge => edge.node))
        } else {
          console.log('❌ No products found in response - using placeholder products')
          if (data.errors) {
            console.error('Shopify API Errors:', data.errors)
          }
          // Fallback to placeholder products
          setProducts([
            {
              id: 'placeholder-1',
              title: 'Crypto Hoodie',
              handle: 'crypto-hoodie',
              images: { edges: [{ node: { url: '/black-hoodie-with-crypto-inspired-streetwear-desig.png', altText: 'Crypto Hoodie' } }] },
              priceRange: { minVariantPrice: { amount: '65.00', currencyCode: 'USD' } },
              tags: ['featured'],
              createdAt: '2024-01-01'
            },
            {
              id: 'placeholder-2', 
              title: 'Base Blockchain T-Shirt',
              handle: 'base-blockchain-tshirt',
              images: { edges: [{ node: { url: '/white-t-shirt-with-base-blockchain-logo-design.png', altText: 'Base T-Shirt' } }] },
              priceRange: { minVariantPrice: { amount: '35.00', currencyCode: 'USD' } },
              tags: ['featured'],
              createdAt: '2024-01-01'
            },
            {
              id: 'placeholder-3',
              title: 'DeFi Baseball Cap', 
              handle: 'defi-baseball-cap',
              images: { edges: [{ node: { url: '/black-baseball-cap-with-defi-embroidered-design.png', altText: 'DeFi Cap' } }] },
              priceRange: { minVariantPrice: { amount: '25.00', currencyCode: 'USD' } },
              tags: ['featured'],
              createdAt: '2024-01-01'
            },
            {
              id: 'placeholder-4',
              title: 'Minted Crewneck',
              handle: 'minted-crewneck', 
              images: { edges: [{ node: { url: '/gray-crewneck-sweatshirt-with-minimalist-minted-lo.png', altText: 'Minted Crewneck' } }] },
              priceRange: { minVariantPrice: { amount: '55.00', currencyCode: 'USD' } },
              tags: ['featured'],
              createdAt: '2024-01-01'
            }
          ])
        }
      } catch (error) {
        console.error('❌ Error fetching Shopify products:', error)
        console.log('Using placeholder products due to API error')
        // Fallback to placeholder products on error
        setProducts([
          {
            id: 'placeholder-1',
            title: 'Crypto Hoodie',
            handle: 'crypto-hoodie',
            images: { edges: [{ node: { url: '/black-hoodie-with-crypto-inspired-streetwear-desig.png', altText: 'Crypto Hoodie' } }] },
            priceRange: { minVariantPrice: { amount: '65.00', currencyCode: 'USD' } },
            tags: ['featured'],
            createdAt: '2024-01-01'
          },
          {
            id: 'placeholder-2', 
            title: 'Base Blockchain T-Shirt',
            handle: 'base-blockchain-tshirt',
            images: { edges: [{ node: { url: '/white-t-shirt-with-base-blockchain-logo-design.png', altText: 'Base T-Shirt' } }] },
            priceRange: { minVariantPrice: { amount: '35.00', currencyCode: 'USD' } },
            tags: ['featured'],
            createdAt: '2024-01-01'
          },
          {
            id: 'placeholder-3',
            title: 'DeFi Baseball Cap', 
            handle: 'defi-baseball-cap',
            images: { edges: [{ node: { url: '/black-baseball-cap-with-defi-embroidered-design.png', altText: 'DeFi Cap' } }] },
            priceRange: { minVariantPrice: { amount: '25.00', currencyCode: 'USD' } },
            tags: ['featured'],
            createdAt: '2024-01-01'
          },
          {
            id: 'placeholder-4',
            title: 'Minted Crewneck',
            handle: 'minted-crewneck', 
            images: { edges: [{ node: { url: '/gray-crewneck-sweatshirt-with-minimalist-minted-lo.png', altText: 'Minted Crewneck' } }] },
            priceRange: { minVariantPrice: { amount: '55.00', currencyCode: 'USD' } },
            tags: ['featured'],
            createdAt: '2024-01-01'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [SHOPIFY_DOMAIN, SHOPIFY_STOREFRONT_TOKEN])

  // Fallback products if Shopify API fails
  const fallbackProducts = [
    {
      id: '1',
      title: "Crypto Hoodie",
      handle: "crypto-hoodie",
      images: { edges: [{ node: { url: "/black-hoodie-with-crypto-inspired-streetwear-desig.png", altText: "Crypto Hoodie" } }] },
      priceRange: { minVariantPrice: { amount: "89.00", currencyCode: "USD" } },
      tags: ["new"],
      createdAt: "2024-01-01"
    },
    {
      id: '2',
      title: "Base Chain Tee",
      handle: "base-chain-tee",
      images: { edges: [{ node: { url: "/white-t-shirt-with-base-blockchain-logo-design.png", altText: "Base Chain Tee" } }] },
      priceRange: { minVariantPrice: { amount: "45.00", currencyCode: "USD" } },
      tags: [],
      createdAt: "2024-01-01"
    },
    {
      id: '3',
      title: "DeFi Dad Hat",
      handle: "defi-dad-hat",
      images: { edges: [{ node: { url: "/black-baseball-cap-with-defi-embroidered-design.png", altText: "DeFi Dad Hat" } }] },
      priceRange: { minVariantPrice: { amount: "35.00", currencyCode: "USD" } },
      tags: ["new"],
      createdAt: "2024-01-01"
    },
    {
      id: '4',
      title: "Minted Crewneck",
      handle: "minted-crewneck",
      images: { edges: [{ node: { url: "/gray-crewneck-sweatshirt-with-minimalist-minted-lo.png", altText: "Minted Crewneck" } }] },
      priceRange: { minVariantPrice: { amount: "75.00", currencyCode: "USD" } },
      tags: [],
      createdAt: "2024-01-01"
    }
  ]

  const displayProducts = products.length > 0 ? products : fallbackProducts

  const formatPrice = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(parseFloat(amount))
  }

  const isNewProduct = (product: ShopifyProduct) => {
    return product.tags.includes('new') || product.tags.includes('NEW')
  }

  const getProductUrl = (handle: string) => {
    return `https://mintedmerch.shop/products/${handle}`
  }

  return (
    <section id="merch" className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-balance">
            Exclusive <span className="text-primary">Merch Drops</span>
          </h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
          Apparel, accessories, & more - designed after your favorite coins, communities, & NFTs. Shop online or in the Minted Merch mini app!
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse border-0 bg-transparent">
                <CardContent className="p-0">
                  <div className="bg-muted aspect-square rounded-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-6 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-transparent">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-lg aspect-square">
                    <img
                      src={product.images.edges[0]?.node.url || "/placeholder.svg"}
                      alt={product.images.edges[0]?.node.altText || product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isNewProduct(product) && (
                      <div className="absolute top-3 left-3 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-semibold">
                        NEW
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{product.title}</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}
                      </span>
                      <Button size="sm" onClick={() => openShopUrl()}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Shop Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" onClick={() => openShopUrl()}>
            <ExternalLink className="h-4 w-4 mr-2" />
            View All Merch
          </Button>
        </div>
      </div>
    </section>
  )
}
