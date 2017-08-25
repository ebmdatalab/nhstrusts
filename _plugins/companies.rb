module Jekyll

  # Define a new type of page for companies
  class CompanyPage < Page
    def initialize(site, base, company, questions)
      company_slug = Jekyll::Utils::slugify(company['publisher_1'])
      @site = site
      @base = base
      @dir = 'companies'
      @name = "#{company_slug}.html"

      self.process(@name)
      self.read_yaml(File.join(base, '_layouts'), 'company.html')
      self.data['company'] = company
      self.data['title'] = company['publisher_1']
      self.data['questions'] = questions
    end
  end

  class CompanyPageGenerator < Generator
    safe true

    def generate(site)
      if site.layouts.key? 'company'
        questions = Hash.new([])
        site.data['questions'].each do |question|
          questions[question['section']] += [question]
        end

        site.data['companies'].each do |company|
          site.pages << CompanyPage.new(site, site.source, company, questions)
        end
      end
    end
  end

end
